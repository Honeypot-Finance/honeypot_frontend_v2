import Image from "next/image";

const LoadingDisplay = ({ size = 200 }: { size?: number }) => {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative">
        <Image
          src="/images/loading/outline.svg"
          alt="loading"
          width={size}
          height={size}
          className="animate-spin"
        />
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
          <Image
            src="/images/loading/rocket.svg"
            alt="loading"
            width={size / 2}
            height={size / 2}
          />
        </div>
      </div>
    </div>
  );
};

const LoadingContainer = ({
  size,
  children,
  isLoading,
}: {
  size?: number;
  isLoading: boolean;
  children: React.ReactNode;
}) => {
  return isLoading ? <LoadingDisplay size={size} /> : children;
};

export { LoadingContainer, LoadingDisplay };
