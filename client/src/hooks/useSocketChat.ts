import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "./useChat";
import { chatService } from "@/services/chatServices";
import type { Conversation, Message } from "@/types/chatType";

// Thêm onMessageStatusChange vào events
export const useSocketChat = (
  selectedConversationId?: string,
  events?: {
    onReceiveMessage?: (message: Message) => void;
    onConversationUpdated?: (conversation: Conversation) => void;
    onNewConversation?: (conversation: Conversation) => void;
    onMessageStatusChange?: (status: {
      isSending: boolean;
      messageId: string;
    }) => void; // Thêm callback này
  }
) => {
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

  useEffect(() => {
    if (!isAuthenticated || !user?._id || !accessToken) return;

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
    }

    const socket = io(socketUrl, {
      path: "/socket.io",
      auth: { userId: user._id, token: accessToken },
      transports: ["websocket"],
      forceNew: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setError(null);

      // SỬA: Truyền đúng format là String đơn giản cho conversationId
      if (selectedConversationId) {
        socket.emit("join_conversation", String(selectedConversationId));
      }
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("connect_error", (err) => {
      setError(err.message);
      toast.error("Socket connection failed", { description: err.message });
    });

    // SỬA: Cập nhật event handler cho new_message để xử lý realtime
    socket.on(
      "new_message",
      (data: { conversationId: string; message: Message }) => {
        const msg = data.message;

        // Tìm và thay thế tin nhắn tạm bằng tin nhắn thật
        queryClient.setQueryData(
          chatKeys.messages(msg.conversationId),
          (old: Message[] = []) => {
            // Kiểm tra nếu có tin nhắn trùng nội dung (do optimistic update)
            const hasSimilarTemp = old.some((m) => {
              // match by temp id pattern and same sender
              if (!m._id.includes("temp-")) return false;
              if (m.senderId !== msg.senderId) return false;

              // If both have text and text matches, consider similar
              if (m.text && msg.text && m.text === msg.text) return true;

              // If both have files, try to match by file count and file names (covers image uploads)
              const mFiles = (m as unknown as { files?: import("@/types/chatType").FileMeta[] })?.files;
              const msgFiles = (msg as unknown as { files?: import("@/types/chatType").FileMeta[] })?.files;
              if (mFiles && msgFiles && mFiles.length > 0 && msgFiles.length > 0) {
                if (mFiles.length === msgFiles.length) {
                  const allNamesMatch = mFiles.every((mf, idx) => {
                    const mfName = mf?.name || '';
                    const rfName = msgFiles[idx]?.name || '';
                    return mfName && rfName && mfName === rfName;
                  });
                  if (allNamesMatch) return true;
                }
              }

              // Fallback: if timestamps are close (30s) and no other mismatch, treat as similar
              if (
                Math.abs(new Date(m.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 30000
              ) {
                return true;
              }

              return false;
            });

            if (hasSimilarTemp) {
              // Thay thế tin nhắn tạm bằng tin nhắn thật
              return old
                .filter((m) => {
                  if (!m._id.includes("temp-")) return true;
                  if (m.senderId !== msg.senderId) return true;

                  // same logic to identify the temp to remove
                  if (m.text && msg.text && m.text === msg.text) return false;
                  const mFiles = (m as unknown as { files?: import("@/types/chatType").FileMeta[] })?.files;
                  const msgFiles = (msg as unknown as { files?: import("@/types/chatType").FileMeta[] })?.files;
                  if (mFiles && msgFiles && mFiles.length === msgFiles.length) {
                    const allNamesMatch = mFiles.every((mf, idx) => {
                      const mfName = mf?.name || '';
                      const rfName = msgFiles[idx]?.name || '';
                      return mfName && rfName && mfName === rfName;
                    });
                    if (allNamesMatch) return false;
                  }

                  if (Math.abs(new Date(m.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 30000) return false;

                  return true;
                })
                .concat(msg);
            }

            // Nếu không có tin nhắn tạm trùng khớp, kiểm tra ID
            const exists = old.some((m) => m._id === msg._id);
            if (exists) return old;

            // Additional dedupe: if an existing REAL message has same signature (sender + text OR same files) and timestamps close, skip adding
            const hasSimilarReal = old.some((m) => {
              if (m._id.startsWith("temp-")) return false; // only compare with real stored messages
              if (m.senderId !== msg.senderId) return false;
              if (m.text && msg.text && m.text === msg.text) return true;
              const mFiles = (m as unknown as { files?: import("@/types/chatType").FileMeta[] })?.files;
              const msgFiles = (msg as unknown as { files?: import("@/types/chatType").FileMeta[] })?.files;
              if (mFiles && msgFiles && mFiles.length === msgFiles.length && mFiles.length > 0) {
                const allNamesMatch = mFiles.every((mf, idx) => {
                  const mfName = mf?.name || '';
                  const rfName = msgFiles[idx]?.name || '';
                  return mfName && rfName && mfName === rfName;
                });
                if (allNamesMatch) return true;
              }
              if (Math.abs(new Date(m.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 2000) return true;
              return false;
            });

            if (hasSimilarReal) return old;

            return [...old, msg];
          }
        );

        // Cập nhật danh sách conversations
        queryClient.setQueryData(
          chatKeys.conversations(),
          (old: Conversation[] = []) => {
            const updated = old.map((conv) =>
              conv._id === msg.conversationId
                ? {
                    ...conv,
                    lastMessage: {
                      text: msg.text,
                      sentBy: msg.senderId,
                      sentAt: msg.createdAt,
                    },
                    updatedAt: msg.createdAt,
                    unreadCount:
                      msg.senderId !== user?._id
                        ? (conv.unreadCount || 0) + 1
                        : conv.unreadCount || 0,
                  }
                : conv
            );

            // Sắp xếp lại conversations theo thời gian cập nhật mới nhất
            return updated.sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            );
          }
        );

        // Thông báo nếu tin nhắn mới từ người khác và không đang xem conversation đó
        if (
          msg.senderId !== user?._id &&
          msg.conversationId !== selectedConversationId
        ) {
          toast.info("Có tin nhắn mới", {
            description:
              msg.text.length > 30
                ? msg.text.substring(0, 30) + "..."
                : msg.text,
          });
        }

        // Gọi callback nếu đang xem conversation này
        if (msg.conversationId === selectedConversationId) {
          events?.onReceiveMessage?.(msg);
        }
      }
    );

    // SỬA: Cập nhật event handler cho conversation_updated để nhận đúng format từ BE
    socket.on(
      "conversation_updated",
      (data: {
        conversationId: string;
        lastMessage: Message;
        unreadCount: number;
      }) => {
        // Lấy danh sách conversation hiện tại
        const conversations =
          queryClient.getQueryData<Conversation[]>(chatKeys.conversations()) ||
          [];

        // Tìm conversation cần update
        const targetConversation = conversations.find(
          (c) => c._id === data.conversationId
        );

        if (targetConversation) {
          // Cập nhật conversation
          const updatedConversation = {
            ...targetConversation,
            lastMessage: {
              text: data.lastMessage.text,
              sentBy: data.lastMessage.senderId,
              sentAt: data.lastMessage.createdAt,
            },
            updatedAt: data.lastMessage.createdAt,
            unreadCount:
              data.lastMessage.senderId !== user?._id
                ? data.unreadCount
                : targetConversation.unreadCount || 0,
          };

          // Cập nhật danh sách conversations
          queryClient.setQueryData(
            chatKeys.conversations(),
            conversations
              .map((c) =>
                c._id === updatedConversation._id ? updatedConversation : c
              )
              .sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime()
              )
          );

          // Gọi callback nếu cần
          events?.onConversationUpdated?.(updatedConversation);
        }
      }
    );

    socket.on("new_conversation", (conv: Conversation) => {
      queryClient.setQueryData(
        chatKeys.conversations(),
        (old: Conversation[] = []) => [conv, ...old]
      );
      events?.onNewConversation?.(conv);
      toast.success("Bạn có cuộc trò chuyện mới");
    });

    // THÊM: Log để debug
    socket.onAny((event, ...args) => {
      console.log(`[Socket] ${event} received:`, args);
    });

    // Thêm event handler cho message_sent trong useEffect socket
    socket.on("message_sent", (data: { message: Message }) => {
      const sentMessage = data.message;

      // Cập nhật tin nhắn trong cache
      queryClient.setQueryData(
        chatKeys.messages(sentMessage.conversationId),
        (old: Message[] = []) => {
          if (!old) return old;

          // Tìm tin nhắn tạm tương ứng để thay thế
          const tempIndex = old.findIndex(
            (m) =>
              m.text === sentMessage.text &&
              m.senderId === sentMessage.senderId &&
              (m.isPending ||
                (typeof m._id === "string" && m._id.startsWith("temp-")))
          );

          if (tempIndex >= 0) {
            // Thay thế tin nhắn tạm bằng tin nhắn thật
            const updatedMessages = [...old];
            updatedMessages[tempIndex] = { ...sentMessage, isPending: false };
            return updatedMessages;
          }

          return old;
        }
      );
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [
    user?._id,
    accessToken,
    isAuthenticated,
    selectedConversationId,
    events,
    queryClient,
    socketUrl,
  ]);

  // Sửa hàm gửi tin nhắn để cập nhật cache ngay lập tức
  const sendMessage = useCallback(
    async (message: {
      conversationId: string;
      text: string;
      files?: File[];
      // allow caller to provide a tempId (so caller-side optimistic messages can share the same id)
      tempId?: string;
    }): Promise<boolean> => {
      const conversationId = String(message.conversationId);
      const tempId = message.tempId ?? `temp-${Date.now()}-${Math.random()}`;

      // Đảm bảo callback được gọi trước khi thực hiện bất kỳ thao tác nào khác
      events?.onMessageStatusChange?.({ isSending: true, messageId: tempId });

      console.log("Starting to send message with tempId:", tempId); // Thêm log

      const tempMessage: Message = {
        _id: tempId,
        conversationId,
        senderId: user?._id || "",
        text: message.text,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        files: [],
        type: "text",
        isRead: false,
        isPending: true,
      };

      // Only insert tempMessage into cache if caller didn't already provide one (i.e. no tempId passed)
      if (!message.tempId) {
        queryClient.setQueryData(
          chatKeys.messages(conversationId),
          (old: Message[] = []) => [...old, tempMessage]
        );
      }

      // Cập nhật lastMessage trong conversations list
      queryClient.setQueryData(
        chatKeys.conversations(),
        (old: Conversation[] = []) => {
          const updated = old.map((conv) =>
            conv._id === conversationId
              ? {
                  ...conv,
                  lastMessage: {
                    text: message.text,
                    sentBy: user?._id || "",
                    sentAt: new Date().toISOString(),
                  },
                  updatedAt: new Date().toISOString(),
                }
              : conv
          );

          return updated.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        }
      );

      // Đặt biến để theo dõi trạng thái gửi
      let messageAcknowledged = false;

      // Thiết lập timeout để đảm bảo hủy trạng thái loading
      const timeoutId = setTimeout(() => {
        if (!messageAcknowledged) {
          console.log("Timeout reached for message:", tempId);
          // Đánh dấu tin nhắn không còn pending
          queryClient.setQueryData(
            chatKeys.messages(conversationId),
            (old: Message[] = []) =>
              (old || []).map((msg) =>
                msg._id === tempId ? { ...msg, isPending: false } : msg
              )
          );

          // Thông báo hoàn tất gửi tin nhắn
          console.log(
            "Calling onMessageStatusChange with isSending=false due to timeout"
          );
          events?.onMessageStatusChange?.({
            isSending: false,
            messageId: tempId,
          });
        }
      }, 2000);

      // If files are provided, upload via REST endpoint before emitting socket
      if (message.files && message.files.length > 0) {
        try {
          // Upload files using chatService
          const res = await chatService.sendFileMessage(conversationId, message.files, message.text);

          // Normalize returned messages
          let returnedMessages: Message[] = [];
          if (Array.isArray(res)) returnedMessages = res as Message[];
          else if (res?.items) returnedMessages = res.items as Message[];
          else if (res?.messages) returnedMessages = res.messages as Message[];
          else if (res?.message) returnedMessages = [res.message] as Message[];
          else if (res) returnedMessages = [res] as Message[];

          // Update messages cache
          queryClient.setQueryData(
            chatKeys.messages(conversationId),
            (old: Message[] = []) => [...old.filter(m => m._id !== tempId), ...returnedMessages]
          );

          // Update conversations lastMessage
          if (returnedMessages.length > 0) {
            const last = returnedMessages[returnedMessages.length - 1];
            queryClient.setQueryData(
              chatKeys.conversations(),
              (old: Conversation[] = []) =>
                old.map((conv) =>
                  conv._id === conversationId
                    ? {
                        ...conv,
                        lastMessage: {
                          text: last.text || (last.files && last.files.length ? 'File' : ''),
                          sentBy: last.senderId,
                          sentAt: last.createdAt,
                        },
                        updatedAt: last.createdAt,
                      }
                    : conv
                )
            );
          }

          events?.onMessageStatusChange?.({ isSending: false, messageId: tempId });
          return true;
        } catch (err) {
          console.error("File upload failed", err);
          // Mark temp message as failed
          queryClient.setQueryData(
            chatKeys.messages(conversationId),
            (old: Message[] = []) =>
              (old || []).map((msg) =>
                msg._id === tempId ? { ...msg, isPending: false, error: true } : msg
              )
          );
          events?.onMessageStatusChange?.({ isSending: false, messageId: tempId });
          toast.error("Gửi file thất bại");
          return false;
        }
      }

      // Otherwise send text via socket as before
      return new Promise((resolve) => {
        socketRef.current!.emit(
          "send_message",
          { conversationId, text: message.text, files: [], tempId },
          (res: { success: boolean; error?: string; message?: Message }) => {
            messageAcknowledged = true;
            clearTimeout(timeoutId); // Xóa timeout để tránh gọi callback trùng lặp

            console.log(
              "Socket response received:",
              res.success ? "success" : "failure"
            );

            if (res && res.success) {
              // Cập nhật tin nhắn tạm thành tin nhắn đã gửi
              queryClient.setQueryData(
                chatKeys.messages(conversationId),
                (old: Message[] = []) => {
                  return old.map((msg) =>
                    msg._id === tempId
                      ? {
                          ...(res.message || msg),
                          isPending: false,
                        }
                      : msg
                  );
                }
              );
              // Đảm bảo gọi callback TRƯỚC khi resolve promise
              console.log(
                "Calling onMessageStatusChange with isSending=false due to success"
              );
              events?.onMessageStatusChange?.({
                isSending: false,
                messageId: tempId,
              });
              resolve(true);
            } else {
              // Nếu lỗi, đánh dấu tin nhắn lỗi
              queryClient.setQueryData(
                chatKeys.messages(conversationId),
                (old: Message[] = []) =>
                  old.map((msg) =>
                    msg._id === tempId
                      ? { ...msg, isPending: false, error: true }
                      : msg
                  )
              );
              // Luôn thông báo kết thúc gửi với tempId ban đầu
              events?.onMessageStatusChange?.({
                isSending: false,
                messageId: tempId,
              });
              toast.error("Gửi tin nhắn thất bại", { description: res.error });
              resolve(false);
            }
          }
        );
      });
    },
    [user?._id, queryClient, events]
  );

  const markAsRead = useCallback(
    (conversationId: string) => {
      socketRef.current?.emit("mark_read", {
        conversationId: String(conversationId),
        userId: user?._id,
      });
      queryClient.setQueryData(
        chatKeys.conversations(),
        (old: Conversation[] = []) =>
          old.map((conv) =>
            conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
      );
    },
    [user?._id, queryClient]
  );

  return {
    isConnected,
    error,
    sendMessage,
    markAsRead,
    socket: socketRef.current,
  };
};
