let lastKnownScrollPosition = 0;
let ticking = false;

let _cachedCustomStickyClones = {};

function getCustomStickyOptions(target) {
  return {
    side: target.dataset.customStickySide,
    offset: parseInt(target.dataset.customStickyOffset),
    media: target.dataset.customStickyMedia,
  };
}

function cloneCustomSticky(target) {
  const clone = target.cloneNode(true);
  clone.style.opacity = "0";
  clone.dataset.customStickyClone = "true";

  return clone;
}

function getOffsetTopCustomSticky(target, offset) {
  return target.offsetTop + target.offsetHeight + offset;
}

function getScrollYCustomSticky(side) {
  return side === "bottom"
    ? lastKnownScrollPosition + innerHeight
    : lastKnownScrollPosition;
}

function isOverscrolledCustomSticky(scrollY, offsetTop, side) {
  return side === "bottom" ? scrollY < offsetTop : scrollY > offsetTop;
}

function useMediaCustomSticky(media, cb) {
  if (media && window.matchMedia(media).matches) {
    cb();
  }
}

function customStickyHandler(opts) {
  const { target, offsetTop, clone, side, offset, media, index } = opts;

  const scrollY = getScrollYCustomSticky(side);
  const isOverscrolled = isOverscrolledCustomSticky(scrollY, offsetTop, side);

  if (isOverscrolled) {
    if (!_cachedCustomStickyClones[index]) {
      target.parentNode.insertBefore(clone, target.nextSibling);
      _cachedCustomStickyClones[index] = clone;
    }
    target.style.transition = "none";
    target.style.width = clone.offsetWidth + "px";
    target.style.height = clone.offsetHeight + "px";
    target.style.position = "fixed";
    target.style[side] = "0";
  } else {
    target.removeAttribute("style");
    clone.remove();
    delete _cachedCustomStickyClones[index];
  }

  useMediaCustomSticky(media, () => {
    target.removeAttribute("style");
    clone.remove();
    delete _cachedCustomStickyClones[index];
  });

  return isOverscrolled
    ? getOffsetTopCustomSticky(clone, offset)
    : getOffsetTopCustomSticky(target, offset);
}

document.addEventListener("scroll", () => {
  lastKnownScrollPosition = window.scrollY;

  if (!ticking) {
    window.requestAnimationFrame(() => {
      const customStickyElements = document.querySelectorAll(
        "[data-custom-sticky]:not([data-custom-sticky-clone])"
      );
      if (customStickyElements.length)
        customStickyElements.forEach((target, index) => {
          const { media, offset, side } = getCustomStickyOptions(target);
          const clone =
            _cachedCustomStickyClones[index] ?? cloneCustomSticky(target);
          let offsetTop = getOffsetTopCustomSticky(
            _cachedCustomStickyClones[index] ?? target,
            offset
          );

          offsetTop = customStickyHandler({
            index,
            target,
            offset,
            side,
            media,
            offsetTop,
            clone,
          });
        });
      ticking = false;
    });

    ticking = true;
  }
});

window.addEventListener("resize", () => {
  lastKnownScrollPosition = window.scrollY;

  if (!ticking) {
    window.requestAnimationFrame(() => {
      const customStickyElements = document.querySelectorAll(
        "[data-custom-sticky]:not([data-custom-sticky-clone])"
      );
      if (customStickyElements.length)
        customStickyElements.forEach((target, index) => {
          const { media, offset, side } = getCustomStickyOptions(target);
          const clone =
            _cachedCustomStickyClones[index] ?? cloneCustomSticky(target);
          let offsetTop = getOffsetTopCustomSticky(
            _cachedCustomStickyClones[index] ?? target,
            offset
          );

          offsetTop = customStickyHandler({
            index,
            target,
            offset,
            side,
            media,
            offsetTop,
            clone,
          });
        });
      ticking = false;
    });

    ticking = true;
  }
});
