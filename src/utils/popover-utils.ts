import { BoundaryType } from "@/hooks/useBoundary";
import { PlacementType } from "@/types/magnifier-types";

export const getInitialCoordinates = (
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

export const getCoordsFromRect = (
  x: number,
  y: number,
  popoverRect: DOMRect
) => ({
  top: y,
  bottom: y + popoverRect.height,
  left: x,
  right: x + popoverRect.width,
});

const OFFSET_DISTANCE = 8;

export const applyOffset = (
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

export const applyFlip = (
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

export const applyShift = (
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
