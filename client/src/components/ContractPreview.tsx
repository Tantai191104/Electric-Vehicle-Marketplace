import React from "react";

interface ContractPreviewProps {
  contractHtml: string;
}

const ContractPreview: React.FC<ContractPreviewProps> = ({ contractHtml }) => {
  return (
    <div className="border p-4 mb-4 bg-gray-50" dangerouslySetInnerHTML={{ __html: contractHtml }} />
  );
};

export default React.memo(ContractPreview);
