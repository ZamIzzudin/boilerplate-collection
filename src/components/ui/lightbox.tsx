import { useEffect, useMemo, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Loader from "./loader";

declare module "yet-another-react-lightbox" {
  interface SlideTypes {
    pdf: { src: string };
  }
}

export interface LightboxImage {
  src: string | Blob;
  alt?: string;
  type?: "image" | "pdf";
}

type ImagesProp = string | string[] | Blob[] | LightboxImage[] | LightboxImage;

interface LightboxProps {
  open: boolean;
  onClose: () => void;
  images: ImagesProp;
  index?: number;
  message?: string;
  loading?: boolean;
}

function isPdfUrl(url: string): boolean {
  return /\.pdf($|[?#])/i.test(url);
}

function isPdfBlob(blob: Blob): boolean {
  return blob.type === "application/pdf";
}

function normalizeImages(images: ImagesProp): LightboxImage[] {
  if (typeof images === "string") {
    return images ? [{ src: images }] : [];
  }
  if (!Array.isArray(images)) {
    return images.src ? [images] : [];
  }
  if (images.length === 0) {
    return [];
  }
  const first = images[0];
  if (typeof first === "string") {
    return (images as string[]).map((src) => ({ src }));
  }
  if (first instanceof Blob) {
    return (images as Blob[]).map((src) => ({ src }));
  }
  return images as LightboxImage[];
}

interface ResolvedSlide {
  src: string;
  alt?: string;
  type: "image" | "pdf";
}

function useResolvedSlides(rawImages: LightboxImage[]): ResolvedSlide[] {
  const [blobUrls, setBlobUrls] = useState<Map<Blob, string>>(new Map());

  const blobs = useMemo(
    () =>
      rawImages
        .map((img) => img.src)
        .filter((s): s is Blob => s instanceof Blob),
    [rawImages],
  );

  useEffect(() => {
    if (blobs.length === 0) {
      setBlobUrls(new Map());
      return;
    }
    const map = new Map<Blob, string>();
    blobs.forEach((blob) => {
      map.set(blob, URL.createObjectURL(blob));
    });
    setBlobUrls(map);

    return () => {
      map.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blobs]);

  return rawImages.map((img) => {
    const isBlob = img.src instanceof Blob;
    const resolvedSrc = isBlob
      ? (blobUrls.get(img.src as Blob) ?? "")
      : (img.src as string);

    const isPdf =
      img.type === "pdf" ||
      (img.type === undefined &&
        (isBlob
          ? isPdfBlob(img.src as Blob)
          : isPdfUrl((img.src as string) ?? "")));

    return {
      src: resolvedSrc,
      alt: img.alt,
      type: isPdf ? "pdf" : "image",
    };
  });
}

function CenterMessage({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex items-center justify-center w-full h-full text-white text-lg">
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex flex-col items-center gap-3 text-white">
      <div className="animate-spin w-10 h-10 border-3 border-white border-t-transparent rounded-full" />
      <span>Memuat...</span>
    </div>
  );
}

function PdfSlide({ src }: Readonly<{ src: string }>) {
  return (
    <object data={src} type="application/pdf" className="w-full h-full p-10">
      <CenterMessage>
        <div className="flex flex-col items-center gap-3">
          <span>Browser tidak dapat menampilkan PDF secara langsung.</span>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-300"
          >
            Buka PDF di tab baru
          </a>
        </div>
      </CenterMessage>
    </object>
  );
}

export function PhotoLightbox({
  open,
  onClose,
  images,
  index = 0,
  message,
  loading,
}: Readonly<LightboxProps>) {
  const normalized = useMemo(() => normalizeImages(images), [images]);
  const resolvedSlides = useResolvedSlides(normalized);

  const slides = resolvedSlides.map((s) =>
    s.type === "pdf"
      ? { type: "pdf" as const, src: s.src }
      : { src: s.src, alt: s.alt },
  );

  const sharedProps = {
    open,
    close: () => onClose(),
    toolbar: { buttons: ["close" as const] },
    controller: { closeOnBackdropClick: true },
    render: {
      iconPrev: () => null,
      iconNext: () => null,
    },
    styles: {
      container: { backgroundColor: "rgba(0,0,0,0.9)" },
      navigationPrev: { display: "none" },
      navigationNext: { display: "none" },
    },
  };

  if (loading) {
    return (
      <Lightbox
        {...sharedProps}
        index={0}
        slides={[{ src: "" }]}
        render={{
          ...sharedProps.render,
          slide: () => (
            <CenterMessage>
              <Loader />
            </CenterMessage>
          ),
        }}
      />
    );
  }

  if (message) {
    return (
      <Lightbox
        {...sharedProps}
        index={0}
        slides={[{ src: "" }]}
        render={{
          ...sharedProps.render,
          slide: () => <CenterMessage>{message}</CenterMessage>,
        }}
      />
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <Lightbox
      {...sharedProps}
      index={index}
      slides={slides}
      render={{
        ...sharedProps.render,
        slide: ({ slide }) => {
          const src = "src" in slide ? slide.src : "";

          if (!src) {
            return (
              <CenterMessage>
                <Spinner />
              </CenterMessage>
            );
          }

          if ("type" in slide && slide.type === "pdf") {
            return <PdfSlide src={src} />;
          }

          return (
            <img
              src={src}
              alt={"alt" in slide ? ((slide as LightboxImage).alt ?? "") : ""}
              className="max-w-full max-h-full object-contain mx-auto"
            />
          );
        },
      }}
    />
  );
}
