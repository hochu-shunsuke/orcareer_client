import Image from "next/image";

interface EntityLogoProps {
  logoUrl?: string | null;
  entityName: string;
  size?: number;
}

/**
 * 企業ロゴを表示する共通コンポーネント
 * ロゴがない場合はプレースホルダーを表示
 */
export function EntityLogo({ logoUrl, entityName, size = 224 }: EntityLogoProps) {
  return (
    <div className="w-56 h-56 flex-shrink-0 bg-white flex items-center justify-center rounded mx-auto md:mx-0">
      {logoUrl && logoUrl.trim() !== '' ? (
        <Image
          src={logoUrl}
          alt={`${entityName}のロゴ`}
          width={size}
          height={size}
          className="object-contain"
        />
      ) : (
        <Image
          src="/placeholder-logo.svg"
          alt="No Logo"
          width={size}
          height={size}
          className="object-contain opacity-60"
        />
      )}
    </div>
  );
}
