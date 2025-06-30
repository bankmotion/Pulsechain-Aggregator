import React from "react";
import { ZeroAddress } from "../../../const/swap";

interface ApprovalStatusProps {
  fromToken: any;
  fromAmount: string;
  isApproved: boolean;
  isApproving: boolean;
}

const ApprovalStatus: React.FC<ApprovalStatusProps> = ({
  fromToken,
  fromAmount,
  isApproved,
  isApproving,
}) => {
  if (!fromToken || fromToken.address === ZeroAddress || !fromAmount) {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-[#1e2030] rounded-xl">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Token Approval Status:</span>
        <div className="flex items-center gap-2">
          {isApproved ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-400">Approved</span>
            </div>
          ) : isApproving ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-yellow-400">Approving...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-red-400">Not Approved</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalStatus; 