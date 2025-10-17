import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/hint";
import { Fragment } from "@/generated/prisma";
import { ExternalLink, ExternalLinkIcon, RefreshCcwIcon } from "lucide-react";
import { useState } from "react";

interface Props {
  data: Fragment;
}

export function FragmentWeb({ data }: Props) {
  const [fragmentKey, setFragmentKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const onRefresh = () => {
    setFragmentKey((prev) => prev + 1);
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(data.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
        <Hint text="Refresh">
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCcwIcon />
          </Button>
        </Hint>
        <Hint text="Click to Copy" side="bottom">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            disabled={!data.url || copied}
            className="flex-1 justify-start text-start font-normal"
          >
            <span className="truncate">{data.url}</span>
          </Button>
        </Hint>
        <Hint text="open link in a new tab" side="bottom" align="start">
          <Button
            size="sm"
            variant="outline"
            disabled={!data.url}
            onClick={() => {
              if (data.url) return;
              window.open(data.url, "_blank");
            }}
          >
            <ExternalLinkIcon />
          </Button>
        </Hint>
      </div>
      <iframe
        key={fragmentKey}
        className="w-full h-full"
        sandbox="allow-forms allow-scripts allow-same-origin"
        loading="lazy"
        src={data.url}
      ></iframe>
    </div>
  );
}
