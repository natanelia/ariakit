import {
  FocusEvent as ReactFocusEvent,
  MouseEvent as ReactMouseEvent,
  SyntheticEvent,
} from "react";
import { contains } from "./dom";
import { isApple } from "./platform";

/**
 * Returns `true` if `event` has been fired within a React Portal element.
 */
export function isPortalEvent(event: SyntheticEvent): boolean {
  return !contains(event.currentTarget, event.target as Element);
}

/**
 * Returns `true` if `event.target` and `event.currentTarget` are the same.
 */
export function isSelfTarget(event: SyntheticEvent | Event): boolean {
  return event.target === event.currentTarget;
}

/**
 * Checks whether the user event is triggering a page navigation in a new tab.
 */
export function isOpeningInNewTab(event: MouseEvent | ReactMouseEvent) {
  const target = event.target as
    | HTMLAnchorElement
    | HTMLButtonElement
    | HTMLInputElement
    | null;
  if (!target) return null;
  const isAppleDevice = isApple();
  if (isAppleDevice && !event.metaKey) return false;
  if (!isAppleDevice && !event.ctrlKey) return false;
  const tagName = target.tagName.toLowerCase();
  if (tagName === "a") return true;
  if (tagName === "button" && target.type === "submit") return true;
  if (tagName === "input" && target.type === "submit") return true;
  return false;
}

/**
 * Creates and dispatches an event.
 * @example
 * fireEvent(document.getElementById("id"), "blur", {
 *   bubbles: true,
 *   cancelable: true,
 * });
 */
export function fireEvent(
  element: Element,
  type: string,
  eventInit?: EventInit
) {
  const event = new Event(type, eventInit);
  return element.dispatchEvent(event);
}

/**
 * Creates and dispatches a blur event.
 * @example
 * fireBlurEvent(document.getElementById("id"));
 */
export function fireBlurEvent(element: Element, eventInit?: FocusEventInit) {
  const event = new FocusEvent("blur", eventInit);
  const defaultAllowed = element.dispatchEvent(event);
  const bubbleInit = { ...eventInit, bubbles: true };
  element.dispatchEvent(new FocusEvent("focusout", bubbleInit));
  return defaultAllowed;
}

/**
 * Creates and dispatches a focus event.
 * @example
 * fireFocusEvent(document.getElementById("id"));
 */
export function fireFocusEvent(element: Element, eventInit?: FocusEventInit) {
  const event = new FocusEvent("focus", eventInit);
  const defaultAllowed = element.dispatchEvent(event);
  const bubbleInit = { ...eventInit, bubbles: true };
  element.dispatchEvent(new FocusEvent("focusin", bubbleInit));
  return defaultAllowed;
}

/**
 * Creates and dispatches a keyboard event.
 * @example
 * fireKeyboardEvent(document.getElementById("id"), "keydown", {
 *   key: "ArrowDown",
 *   shiftKey: true,
 * });
 */
export function fireKeyboardEvent(
  element: Element,
  type: string,
  eventInit?: KeyboardEventInit
) {
  const event = new KeyboardEvent(type, eventInit);
  return element.dispatchEvent(event);
}

/**
 * Creates and dispatches a click event.
 * @example
 * fireClickEvent(document.getElementById("id"));
 */
export function fireClickEvent(element: Element, eventInit?: PointerEventInit) {
  const event = new MouseEvent("click", eventInit);
  return element.dispatchEvent(event);
}

/**
 * Checks whether the focus/blur event is happening from/to outside of the
 * container element.
 * @example
 * const element = document.getElementById("id");
 * element.addEventListener("blur", (event) => {
 *   if (isFocusEventOutside(event)) {
 *     // ...
 *   }
 * });
 */
export function isFocusEventOutside(
  event: ReactFocusEvent | FocusEvent,
  container?: Element | null
) {
  const containerElement = container || (event.currentTarget as Element);
  const relatedTarget = event.relatedTarget as HTMLElement | null;
  return !relatedTarget || !contains(containerElement, relatedTarget);
}

/**
 * Runs a callback on the next animation frame, but before a certain event.
 */
export function queueBeforeEvent(
  element: Element,
  type: string,
  callback: () => void
) {
  const raf = requestAnimationFrame(() => {
    element.removeEventListener(type, callImmediately, true);
    callback();
  });
  const callImmediately = () => {
    cancelAnimationFrame(raf);
    callback();
  };
  // By listening to the event in the capture phase, we make sure the callback
  // is fired before the respective React events.
  element.addEventListener(type, callImmediately, {
    once: true,
    capture: true,
  });
  return raf;
}

/**
 * Adds a global event listener, including on child frames.
 */
export function addGlobalEventListener<K extends keyof DocumentEventMap>(
  type: K,
  listener: (event: DocumentEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
  scope?: Window
): () => void;
export function addGlobalEventListener(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
  scope?: Window
): () => void;
export function addGlobalEventListener(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
  scope: Window = window
) {
  // Prevent errors from "sandbox" frames.
  try {
    scope.document.addEventListener(type, listener, options);
  } catch (e) {}

  const listeners: Array<() => void> = [];
  for (let i = 0; i < scope.frames?.length; i += 1) {
    const frameWindow = scope.frames[i];
    if (frameWindow) {
      listeners.push(
        addGlobalEventListener(type, listener, options, frameWindow)
      );
    }
  }
  const removeEventListener = () => {
    try {
      scope.document.removeEventListener(type, listener, options);
    } catch (e) {}
    listeners.forEach((listener) => listener());
  };
  return removeEventListener;
}
