export type AnimationName = 
    | "shake-y"
    | "shake-x"
    | "frustrated-wobble"
    | "scared-jump"
    | "none"


export function triggerAnimation(
    element: HTMLElement | null,
    animationName: AnimationName,
    duration: number = 600 // can change
) {
    if (!element || animationName === "none") return;

    element.classList.remove(
        "anim-shake-y",
        "anim-shake-x",
        "anim-frustrated-wobble",
        "scared-jump",
    );

    void element.offsetWidth;

    element.classList.add(`anim-${animationName}`);

    setTimeout(() => {
        element.classList.remove(`anim-${animationName}`);
    }, duration);
}

export function triggerNodeAnimation(
    node: { animation?: AnimationName } | null,
    buttonEl: HTMLElement | null
) {
    if (!node?.animation || !buttonEl) return;

    buttonEl.classList.remove(
        "anim-shake-x",
        "anim-shake-y",
        "anim-frustrated-wobble",
        "scared-jump",
    );

    void buttonEl.offsetWidth;
    
    buttonEl.classList.add(`anim-${node.animation}`);
}

