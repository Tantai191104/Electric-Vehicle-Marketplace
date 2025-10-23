import React, { useRef } from "react";
import SignaturePad from "signature_pad";

interface SignaturePadComponentProps {
  onChange: (dataUrl: string) => void;
}

export const SignaturePadComponent: React.FC<SignaturePadComponentProps> = ({ onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      padRef.current = new SignaturePad(canvas, {
        backgroundColor: "#fff",
        penColor: "#222"
      });
      // Listen for 'end' event
      const handleEnd = () => {
        if (padRef.current) {
          onChange(padRef.current.toDataURL());
        }
      };
      padRef.current.on(); // enable event listeners
      canvas.addEventListener("mouseup", handleEnd);
      canvas.addEventListener("touchend", handleEnd);
      return () => {
        canvas.removeEventListener("mouseup", handleEnd);
        canvas.removeEventListener("touchend", handleEnd);
        padRef.current?.off();
      };
    }
  }, [onChange]);

  const handleClear = () => {
    padRef.current?.clear();
    onChange("");
  };

  return (
    <div>
      <canvas ref={canvasRef} width={400} height={96} style={{ border: "1px solid #ccc", background: "#fff", borderRadius: 8 }} />
      <button type="button" onClick={handleClear} style={{ marginTop: 8 }}>Xóa chữ ký</button>
    </div>
  );
};
