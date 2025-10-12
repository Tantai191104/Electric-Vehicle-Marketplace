import React, { useEffect, useRef, useState } from "react";
import { Upload, Image, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core/dist/types";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDeleteOutline } from "react-icons/md";

interface ImagesFormProps {
    images: string[];
    setImages: (images: string[]) => void;
    maxImages?: number;
    label?: string;
}

interface SortableItemProps {
    id: string;
    img: string;
    index: number;
    handleRemove: (index: number) => void;
    isCover: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, img, index, handleRemove, isCover }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        position: "relative",
    };

    return (
        <div ref={setNodeRef} style={style} className="flex flex-col items-center">
            <Image
                src={img}
                width={90}
                height={90}
                style={{ objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }}
                preview
            />
            {isCover && (
                <div
                    className="absolute left-0 bottom-0 w-full bg-black bg-opacity-70 text-white text-xs font-semibold py-1 rounded-b-[8px] flex justify-center items-center"
                    style={{ borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}
                >
                    Hình bìa
                </div>
            )}
            <div
                {...listeners}
                {...attributes}
                className="absolute top-1 left-1 cursor-move text-white bg-black bg-opacity-50 px-1 rounded"
            >
                ⋮
            </div>
            <Button
                type="default"
                size="small"
                danger
                style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    fontSize: 12,
                    padding: "0 8px",
                    borderRadius: 8,
                }}
                onClick={() => handleRemove(index)}
            >
                <MdDeleteOutline />
            </Button>
        </div>
    );
};

const ImagesForm: React.FC<ImagesFormProps> = ({
    images,
    setImages,
    maxImages = 12,
    label = "Hình ảnh",
}) => {
    const blobUrlsRef = useRef<string[]>([]);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        return () => {
            blobUrlsRef.current.forEach((url) => {
                if (url.startsWith("blob:")) URL.revokeObjectURL(url);
            });
        };
    }, []);

    const handleChange = (info: { fileList: UploadFile[] }) => {
        blobUrlsRef.current.forEach((url) => {
            if (url.startsWith("blob:")) URL.revokeObjectURL(url);
        });
        blobUrlsRef.current = [];

        const imgs: string[] = info.fileList
            .map((file) => {
                if (file.originFileObj) {
                    const url = URL.createObjectURL(file.originFileObj);
                    blobUrlsRef.current.push(url);
                    return url;
                }
                return "";
            })
            .filter((url) => url);

        setFileList(info.fileList);
        setImages(imgs);
    };

    const handleRemove = (index: number) => {
        const removedImg = images[index];
        if (removedImg.startsWith("blob:")) {
            URL.revokeObjectURL(removedImg);
        }
        blobUrlsRef.current = blobUrlsRef.current.filter((url) => url !== removedImg);

        const newFileList = fileList.filter((_, i) => i !== index);
        setFileList(newFileList);

        setImages(images.filter((_, i) => i !== index));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = images.findIndex((_, i) => i.toString() === active.id);
            const newIndex = images.findIndex((_, i) => i.toString() === over.id);
            setImages(arrayMove(images, oldIndex, newIndex));
            setFileList(arrayMove(fileList, oldIndex, newIndex));
        }
    };

    return (
        <section className="space-y-2">
            <div className="font-semibold text-lg">{label}</div>
            <Upload
                multiple
                listType="picture-card"
                beforeUpload={() => false}
                onChange={handleChange}
                showUploadList={false}
                accept="image/*"
                fileList={fileList}
                maxCount={maxImages}
            >
                {images.length < maxImages && (
                    <div className="flex flex-col items-center justify-center gap-1">
                        <UploadOutlined />
                        <span>Tải lên</span>
                    </div>
                )}
            </Upload>

            {images.length > 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={images.map((_, i) => i.toString())} strategy={verticalListSortingStrategy}>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {images.map((img, idx) => (
                                <SortableItem
                                    key={idx}
                                    id={idx.toString()}
                                    img={img}
                                    index={idx}
                                    handleRemove={handleRemove}
                                    isCover={idx === 0}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </section>
    );
};

export default ImagesForm;
