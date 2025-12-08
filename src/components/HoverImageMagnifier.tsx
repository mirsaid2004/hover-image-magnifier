import React, { useCallback, useEffect, useRef, useState } from "react";
import { BoundaryType, useBoundary } from "./useBoundary";

type ContainerLayers =
  | "container"
  | "img"
  | "previewContainer"
  | "previewImage";

type PlacementType = "right" | "left" | "top" | "bottom";

const getInitialCoordinates = (
  childrenRect: DOMRect,
  popoverRect: DOMRect,
  placement: PlacementType
) => {
  switch (placement) {
    case "top": {
      return {
        y: childrenRect.top - popoverRect.height,
        x: childrenRect.left + childrenRect.width / 2 - popoverRect.width / 2,
      };
    }
    case "bottom":
      return {
        y: childrenRect.bottom,
        x: childrenRect.left + childrenRect.width / 2 - popoverRect.width / 2,
      };
    case "left":
      return {
        y: childrenRect.top + childrenRect.height / 2 - popoverRect.height / 2,
        x: childrenRect.left - popoverRect.width,
      };
    case "right":
      return {
        y: childrenRect.top + childrenRect.height / 2 - popoverRect.height / 2,
        x: childrenRect.right,
      };
    default:
      return {
        y: 0,
        x: 0,
      };
  }
};

const getCoordsFromRect = (x: number, y: number, popoverRect: DOMRect) => ({
  top: y,
  bottom: y + popoverRect.height,
  left: x,
  right: x + popoverRect.width,
});

const OFFSET_DISTANCE = 8;

const applyOffset = (
  x: number,
  y: number,
  placement: PlacementType
): [number, number, PlacementType] => {
  switch (placement) {
    case "top":
      y -= OFFSET_DISTANCE;
      break;
    case "bottom":
      y += OFFSET_DISTANCE;
      break;
    case "left":
      x -= OFFSET_DISTANCE;
      break;
    case "right":
      x += OFFSET_DISTANCE;
      break;
  }
  return [x, y, placement];
};

const applyFlip = (
  x: number,
  y: number,
  placement: PlacementType,
  popoverRect: DOMRect,
  childrenRect: DOMRect,
  boundary: BoundaryType
): [number, number, PlacementType] => {
  const currentCoords = getCoordsFromRect(x, y, popoverRect);

  let newX = x;
  let newY = y;
  let newPlacement = placement;

  if (placement === "top" && currentCoords.top < boundary.top) {
    newPlacement = "bottom";
    ({ x: newX, y: newY } = getInitialCoordinates(
      childrenRect,
      popoverRect,
      newPlacement
    ));
  } else if (placement === "bottom" && currentCoords.bottom > boundary.bottom) {
    newPlacement = "top";
    ({ x: newX, y: newY } = getInitialCoordinates(
      childrenRect,
      popoverRect,
      newPlacement
    ));
  } else if (placement === "left" && currentCoords.left < boundary.left) {
    newPlacement = "right";
    ({ x: newX, y: newY } = getInitialCoordinates(
      childrenRect,
      popoverRect,
      newPlacement
    ));
  } else if (placement === "right" && currentCoords.right > boundary.right) {
    newPlacement = "left";
    ({ x: newX, y: newY } = getInitialCoordinates(
      childrenRect,
      popoverRect,
      newPlacement
    ));
  }

  if (newPlacement !== placement) {
    [newX, newY] = applyOffset(newX, newY, newPlacement);
  }

  return [newX, newY, newPlacement];
};

const applyShift = (
  x: number,
  y: number,
  popoverRect: DOMRect,
  boundary: BoundaryType
): [number, number] => {
  let shiftedX = x;
  let shiftedY = y;

  const leftOverflow = shiftedX - boundary.left;
  const rightOverflow = shiftedX + popoverRect.width - boundary.right;

  if (leftOverflow < 0) {
    shiftedX -= leftOverflow;
  } else if (rightOverflow > 0) {
    shiftedX -= rightOverflow;
  }

  const topOverflow = shiftedY - boundary.top;
  const bottomOverflow = shiftedY + popoverRect.height - boundary.bottom;

  if (topOverflow < 0) {
    shiftedY -= topOverflow;
  } else if (bottomOverflow > 0) {
    shiftedY -= bottomOverflow;
  }

  return [shiftedX, shiftedY];
};

interface IHoverImageMagnifier {
  src: string;
  alt?: string;
  placement?: PlacementType;
  positionOffset?: [number, number];
  mode?: "preview" | "magnifier";
  width?: number;
  height?: number;
  previewWidth?: number;
  previewHeight?: number;
  zoomLevel?: number;
  className?: string;
  classNames?: Partial<Record<ContainerLayers, string>>;
  style?: React.CSSProperties;
  styles?: Partial<Record<ContainerLayers, React.CSSProperties>>;
}

function HoverImageMagnifier({
  src,
  alt,
  width: imgWidth,
  height: imgHeight,
  previewWidth = 400,
  previewHeight = 400,
  placement = "right",
  positionOffset,
  className,
  classNames,
  style,
  styles,
  mode = "magnifier",
  zoomLevel = 1,
}: IHoverImageMagnifier) {
  const boundary = useBoundary();
  const [isHovering, setIsHovering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
    naturalWidth: number;
    naturalHeight: number;
  } | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const childrenRef = useRef<HTMLImageElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updateViewPosition = useCallback(() => {
    if (!childrenRef.current || !popoverRef.current) return;
    const childElement = childrenRef.current;
    const popoverElement = popoverRef.current;

    const childClientRect = childElement.getBoundingClientRect();
    const popoverClientRect = popoverElement.getBoundingClientRect();

    let { x, y } = getInitialCoordinates(
      childClientRect,
      popoverClientRect,
      placement
    );

    let currentPlacement = placement;

    [x, y, currentPlacement] = applyOffset(x, y, currentPlacement);

    [x, y, currentPlacement] = applyFlip(
      x,
      y,
      currentPlacement,
      popoverClientRect,
      childClientRect,
      boundary
    );

    [x, y] = applyShift(x, y, popoverClientRect, boundary);

    popoverElement.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, [placement, boundary]);

  useEffect(() => {
    if (!popoverRef.current || !childrenRef.current) return;

    const rafId = requestAnimationFrame(updateViewPosition);

    window.addEventListener("scroll", updateViewPosition, { passive: true });
    window.addEventListener("resize", updateViewPosition);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", updateViewPosition);
      window.removeEventListener("resize", updateViewPosition);
    };
  }, [placement, updateViewPosition]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isHovering) {
      setIsMounted(true);
    } else {
      timeoutRef.current = setTimeout(() => {
        setIsMounted(false);
        setMousePosition(null);
      }, 250);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHovering]);

  // Load image to get natural dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (childrenRef.current) {
        const rect = childrenRef.current.getBoundingClientRect();
        setImageSize({
          width: rect.width,
          height: rect.height,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        });
      }
    };
    img.src = src;

    // Also update on resize
    const handleResize = () => {
      if (childrenRef.current) {
        const rect = childrenRef.current.getBoundingClientRect();
        setImageSize((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            width: rect.width,
            height: rect.height,
          };
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [src]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      if (mode !== "magnifier" || !childrenRef.current || !imageSize) return;

      const rect = childrenRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, imageSize.width));
      const y = Math.max(0, Math.min(e.clientY - rect.top, imageSize.height));

      setMousePosition({ x, y });
    },
    [mode, imageSize]
  );

  return (
    <div
      className={`${classNames?.container || ""} ${className || ""}`}
      style={{ ...style, position: "relative" }}
    >
      <img
        ref={childrenRef}
        src={src}
        alt={alt}
        width={imgWidth}
        height={imgHeight}
        className={`${classNames?.img || ""} hover-image-magnifier-img`}
        style={styles?.img}
        onMouseLeave={() => {
          setIsHovering(false);
          setMousePosition(null);
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseMove={handleMouseMove}
      />

      {/* Preview or Magnifier */}
      <div
        ref={popoverRef}
        className={`${
          classNames?.previewContainer || ""
        } hover-image-magnifier-preview-container`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: `${previewWidth}px`,
          height: `${previewHeight}px`,
          visibility: isMounted ? "visible" : "hidden",
          border: "2px solid rgba(255, 255, 255, 0.8)",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "white",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)",
          zIndex: 1000,
          transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
          opacity: isHovering ? 1 : 0,
          pointerEvents: isHovering ? "auto" : "none",
          ...styles?.previewContainer,
        }}
      >
        {mode === "preview" ? (
          <img
            className={`${
              classNames?.previewImage || ""
            } hover-image-magnifier-preview-image`}
            src={src}
            alt={alt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              ...styles?.previewImage,
            }}
          />
        ) : (
          // Magnifier mode
          <div
            className={`${
              classNames?.previewImage || ""
            } hover-image-magnifier-preview-image`}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              backgroundImage: `url(${src})`,
              backgroundSize: imageSize
                ? (() => {
                    // Calculate the zoomed dimensions in natural pixels
                    const scaledWidth = imageSize.naturalWidth * zoomLevel;
                    const scaledHeight = imageSize.naturalHeight * zoomLevel;

                    // Ensure it covers the preview container to avoid white space
                    const naturalAspect =
                      imageSize.naturalWidth / imageSize.naturalHeight;
                    const previewAspect = previewWidth / previewHeight;

                    // Use explicit pixel values to match position calculation
                    if (previewAspect > naturalAspect) {
                      // Preview is wider - fit to height and scale width proportionally
                      const bgHeight = Math.max(scaledHeight, previewHeight);
                      const bgWidth = bgHeight * naturalAspect;
                      return `${bgWidth}px ${bgHeight}px`;
                    } else {
                      // Preview is taller - fit to width and scale height proportionally
                      const bgWidth = Math.max(scaledWidth, previewWidth);
                      const bgHeight = bgWidth / naturalAspect;
                      return `${bgWidth}px ${bgHeight}px`;
                    }
                  })()
                : "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition:
                mousePosition && imageSize
                  ? (() => {
                      // Get the ratio of mouse position on displayed image (0 to 1)
                      const ratioX = mousePosition.x / imageSize.width;
                      const ratioY = mousePosition.y / imageSize.height;

                      // Calculate the actual background size after zoom (matching backgroundSize calculation)
                      const naturalAspect =
                        imageSize.naturalWidth / imageSize.naturalHeight;
                      const previewAspect = previewWidth / previewHeight;

                      let actualBgWidth: number;
                      let actualBgHeight: number;

                      // Determine actual rendered size (must match backgroundSize calculation above)
                      const scaledWidth = imageSize.naturalWidth * zoomLevel;
                      const scaledHeight = imageSize.naturalHeight * zoomLevel;

                      if (previewAspect > naturalAspect) {
                        // Preview wider - background fits height (auto height)
                        actualBgHeight = Math.max(scaledHeight, previewHeight);
                        actualBgWidth = actualBgHeight * naturalAspect;
                      } else {
                        // Preview taller - background fits width (auto width)
                        actualBgWidth = Math.max(scaledWidth, previewWidth);
                        actualBgHeight = actualBgWidth / naturalAspect;
                      }

                      // Calculate where the hovered point is in the background image coordinates
                      const hoveredXInBg = ratioX * actualBgWidth;
                      const hoveredYInBg = ratioY * actualBgHeight;

                      // Position background to center the hovered point in preview
                      let bgX = previewWidth / 2 - hoveredXInBg;
                      let bgY = previewHeight / 2 - hoveredYInBg;

                      // Clamp to boundaries to prevent white space
                      const minX = Math.min(0, previewWidth - actualBgWidth);
                      const minY = Math.min(0, previewHeight - actualBgHeight);
                      const maxX = 0;
                      const maxY = 0;

                      bgX = Math.max(minX, Math.min(maxX, bgX));
                      bgY = Math.max(minY, Math.min(maxY, bgY));

                      return `${bgX}px ${bgY}px`;
                    })()
                  : "center",
              ...styles?.previewImage,
            }}
          />
        )}
      </div>
    </div>
  );
}

export default HoverImageMagnifier;
