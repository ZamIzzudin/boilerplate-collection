import { UserIcon } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type Props = {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
  image?: string | null;
  imageAlt?: string;
  isImage?: boolean;
  children: React.ReactNode;
};

export function AppLayout({
  title,
  description,
  actions,
  image,
  imageAlt = "logo",
  isImage = false,
  children,
}: Readonly<Props>) {
  return (
    <section className="p-6 space-y-4 bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          {image && imageAlt && (
            <Avatar className="size-12">
              {isImage ? (
                <AvatarImage src={image} alt={imageAlt} />
              ) : (
                <AvatarFallback className="bg-primary-container">
                  <UserIcon size={20} className="text-on-primary-container" />
                </AvatarFallback>
              )}
            </Avatar>
          )}
          <div>
            {typeof title === "string" ? (
              <h1 className="text-lg font-semibold">{title}</h1>
            ) : (
              title
            )}
            {description ? (
              <p className="text-sm text-gray-400">{description}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      <div>{children}</div>
    </section>
  );
}
