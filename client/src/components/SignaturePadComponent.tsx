import React, { useRef, useEffect } from "react";
import SignaturePad from "signature_pad";

interface SignaturePadComponentProps {
  onChange: (dataUrl: string) => void;
}

export const SignaturePadComponent: React.FC<SignaturePadComponentProps> = ({ onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Fix 1️⃣: Scale canvas cho màn hình có devicePixelRatio cao (Retina)
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d")?.scale(ratio, ratio);

    // Fix 2️⃣: Khởi tạo SignaturePad đúng cách
    padRef.current = new SignaturePad(canvas, {
      backgroundColor: "#fff",
      penColor: "#222",
    });

    // Lắng nghe khi người dùng vẽ xong
    const handleEnd = () => {
      if (padRef.current && !padRef.current.isEmpty()) {
        const dataUrl = padRef.current.toDataURL();
        console.log("✍️ Signature captured:", dataUrl.substring(0, 50));
        onChange(dataUrl);
      }
    };

    padRef.current.addEventListener("endStroke", handleEnd);

    // Cleanup
    return () => {
      padRef.current?.removeEventListener("endStroke", handleEnd);
      padRef.current = null;
    };
  }, [onChange]);
  return (
    <div style={{ display: "inline-block" }}>
      <canvas
        ref={canvasRef}
        width={400}
        height={96}
        style={{
          width: 400,
          height: 96,
          border: "1px solid #ccc",
          background: "#fff",
          borderRadius: 8,
          touchAction: "none", // Fix 3️⃣: Cho phép vẽ trên thiết bị cảm ứng
        }}
      />
    </div>
  );
};
