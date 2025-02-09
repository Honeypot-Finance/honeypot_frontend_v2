import React from "react";
import { FaXTwitter } from "react-icons/fa6";
import { Skeleton } from "@/components/ui/skeleton";
import { FaTelegram, FaGlobe } from "react-icons/fa";
import { Copy } from "@/components/Copy";
import { VscCopy } from "react-icons/vsc";
import PairStatus from "@/components/atoms/TokenStatusDisplay/PairStatus";
import { MemePairContract } from "@/services/contract/launches/pot2pump/memepair-contract";

interface ProjectTitleProps {
  name?: string;
  displayName?: string;
  telegram?: string;
  twitter?: string;
  website?: string;
  address?: string;
  statusColor?: string;
  status?: string;
  isValidated?: boolean;
}

const ProjectTitle: React.FC<ProjectTitleProps> = ({
  name,
  displayName,
  telegram,
  twitter,
  website,
  address,
  statusColor,
  status,
  isValidated,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {displayName ? (
            <div className="text-2xl text-[#5C5C5C]/60">{displayName}</div>
          ) : (
            <Skeleton className="h-5 w-20 bg-slate-200" />
          )}
          {name ? (
            <div className="text-sm">({name})</div>
          ) : (
            <Skeleton className="h-8 w-[140px] bg-slate-200" />
          )}
        </div>

        {telegram && (
          <a
            href={telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 text-[#5C5C5C]"
          >
            <FaTelegram size={16} />
          </a>
        )}
        {twitter && (
          <a
            href={twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 text-[#5C5C5C]"
          >
            <FaXTwitter size={16} />
          </a>
        )}
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 text-[#5C5C5C]"
          >
            <FaGlobe size={16} />
          </a>
        )}
        {address && (
          <Copy
            content="Copy address"
            value={address}
            displayContent={
              <div className="relative hover:opacity-80 text-[#5C5C5C]">
                <VscCopy size={16} />
              </div>
            }
          />
        )}
        <PairStatus
          statusColor={statusColor}
          status={status}
          isValidated={isValidated}
        />
      </div>
    </div>
  );
};

export default ProjectTitle;
