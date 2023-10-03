import { BehaviorSubject } from "rxjs"
import { TransformValueType } from "../types"

export type XY = {
  x: number
  y: number
}
export class DragAndZoom {
  factor = 0.05
  minScale = 0.1
  maxScale = 10
  ts: BehaviorSubject<TransformValueType>

  inertiaAnimationFrame = -1
  isDrag = false
  isScale = false
  dragged = false
  threshold = 1
  startPoint = {
    x: 0,
    y: 0,
  }
  previousPosition = {
    x: 0,
    y: 0,
  }
  private maximumInertia = 40
  velocity = {
    x: 0,
    y: 0,
  }
  private deceleration = 0.9
  startDist = 0
  startScale = 1
  targetElement: HTMLElement
  eventElement: HTMLElement
  isPlaying: boolean = false;
  restrictPosition?: (current: XY, targetEl: DOMRect) => XY
  bezelTimeout: NodeJS.Timeout | null = null
  noVideoMove: boolean = false
  constructor(ts: BehaviorSubject<TransformValueType>, targetElement: HTMLElement,
    eventElement?: HTMLElement, configs?: {
      noVideoMove?: boolean
    }, restrictPosition?: (current: XY, targetEl: DOMRect) => XY) {
    this.ts = ts
    this.targetElement = targetElement
    this.eventElement = eventElement ?? targetElement
    this.noVideoMove = configs?.noVideoMove ?? false
    this.restrictPosition = restrictPosition
  }
  getTransformValue() {
    return this.ts.getValue()
  }
  setTransformValue(value: TransformValueType) {
    this.ts.next(value)
  }
  toggleRotation() {
    let currentRotate = this.getTransformValue().rotate
    if (currentRotate === 0) {
      currentRotate = 90
    } else if (currentRotate === 90) {
      currentRotate = 180
    } else if (currentRotate === 180) {
      currentRotate = 270
    } else if (currentRotate === 270) {
      currentRotate = 0
    }
    this.setTransformValue({
      ...this.getTransformValue(),
      rotate: currentRotate,
      scale: 1,
    })
  }
  private capSpeed = (value: number) => {
    let res = 0
    if (Math.abs(value) > this.maximumInertia) {
      res = this.maximumInertia
      res *= value < 0 ? -1 : 1
      return res
    }
    return value
  }
  restrictXY = (currentPosition: { x: number; y: number }) => {
    let { x, y } = currentPosition
    if (!this.targetElement) return { x, y }
    if (!this.restrictPosition) {
      return { x, y }
    }
    const imageBound = this.targetElement.getBoundingClientRect()
    return this.restrictPosition(currentPosition, imageBound)
  }
  private updateInertia = () => {
    this.velocity.x = this.velocity.x * this.deceleration
    this.velocity.y = this.velocity.y * this.deceleration

    this.velocity.x = Math.round(this.velocity.x * 10) / 10
    this.velocity.y = Math.round(this.velocity.y * 10) / 10

    const nextX = Math.round(this.ts.getValue().translate.x + this.velocity.x)
    const nextY = Math.round(this.ts.getValue().translate.y + this.velocity.y)
    const nextTranslate = this.restrictXY({
      x: nextX,
      y: nextY,
    })
    this.setTransformValue({
      ...this.getTransformValue(),
      translate: {
        ...nextTranslate
      },
    })
    if (
      Math.floor(Math.abs(this.velocity.x)) !== 0 ||
      Math.floor(Math.abs(this.velocity.y)) !== 0
    ) {
      this.inertiaAnimationFrame = requestAnimationFrame(this.updateInertia)
    }
  }
  dragFinish = () => {
    this.velocity = {
      x: this.capSpeed(this.restrictXY(this.velocity).x),
      y: this.capSpeed(this.restrictXY(this.velocity).y),
    }
    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      this.inertiaAnimationFrame = requestAnimationFrame(this.updateInertia)
    }
  }
  restore = () => {
    this.ts.next({
      rotate: 0,
      scale: 1,
      translate: {
        x: 0,
        y: 0,
      },
      scaleX: 1,
    })
  };
  private isTouchEvent = (event: any): event is TouchEvent => {
    return "touches" in event;
  };
  on = (event: any) => {
    if (!this.noVideoMove) {
      const currentVideo = document.querySelector("video") as HTMLVideoElement;
      if (currentVideo) {
        this.isPlaying = !currentVideo.paused;
      }
    }
    if (event.button) {
      if (event.preventDefault != undefined) event.preventDefault();
      if (event.stopPropagation != undefined) event.stopPropagation();
      event.cancelBubble = false;
      return false;
    }
    if (this.isTouchEvent(event) && event.touches.length === 2) {
      this.isDrag = false;
      this.isScale = true;
      // 터치 시작시 두손가락 거리
      this.startDist = Math.hypot(
        event.touches[0].pageX - event.touches[1].pageX,
        event.touches[0].pageY - event.touches[1].pageY
      );
      // 터치 시작시 스케일
      this.startScale = this.ts.getValue().scale;
    } else {
      cancelAnimationFrame(this.inertiaAnimationFrame);
      this.isDrag = true;
      this.isScale = false;
      this.startPoint = {
        x: this.isTouchEvent(event) ? event.touches[0].pageX : event.pageX,
        y: this.isTouchEvent(event) ? event.touches[0].pageY : event.pageY,
      };
      this.previousPosition = {
        x: this.ts.getValue().translate.x,
        y: this.ts.getValue().translate.y,
      };
      this.velocity = { x: 0, y: 0 };
    }
    const eventTarget = this.eventElement ?? this.targetElement;
    if (event.touches) {
      eventTarget.addEventListener("touchmove", this.onMove, { passive: true });
      eventTarget.addEventListener("touchend", this.onEnd);
    } else {
      eventTarget.addEventListener("mousemove", this.onMove, { passive: true });
      eventTarget.addEventListener("mouseup", this.onEnd);
      eventTarget.addEventListener("mouseleave", this.onEnd);
    }
  };
  private onMove = (event: TouchEvent | MouseEvent) => {
    if (!this.targetElement) return;
    // 중첩 실행 문제 (성능) 해결 :: 굳이 할 필요없음.
    let func = this.eventElement
      ? this.eventElement.ontouchmove
      : this.targetElement.ontouchmove;
    this.targetElement.ontouchmove = null;

    // 드래그 이벤트 (현재 없음)
    if (
      this.isDrag &&
      ((this.isTouchEvent(event) && event.touches.length === 1) ||
        !this.isTouchEvent(event))
    ) {
      const x = this.isTouchEvent(event) ? event.touches[0].pageX : event.pageX;
      const y = this.isTouchEvent(event) ? event.touches[0].pageY : event.pageY;
      const oldX = this.ts.getValue().translate.x;
      const oldY = this.ts.getValue().translate.y;
      const isInvert = false;
      const invert = isInvert ? 1 : -1;

      const nextTranslateX =
        this.previousPosition.x + invert * (-x + this.startPoint.x);
      const nextTranslateY =
        this.previousPosition.y + invert * (-y + this.startPoint.y);
      const nextTranslate = this.restrictXY({
        x: nextTranslateX,
        y: nextTranslateY,
      });
      this.setTransformValue({
        ...this.getTransformValue(),
        translate: nextTranslate,
      })

      this.velocity = {
        x: nextTranslateX - oldX,
        y: nextTranslateY - oldY,
      };
      if (
        Math.abs(this.previousPosition.x - nextTranslateX) >
        this.threshold ||
        Math.abs(this.previousPosition.y - nextTranslateY) > this.threshold
      ) {
        this.dragged = true;
        if (!this.noVideoMove) {
          if (document.body) document.body.setAttribute("ytme-hide", "");
          const currentVideo = document.querySelector(
            "video"
          ) as HTMLVideoElement;
          if (currentVideo) {
            if (this.bezelTimeout) clearTimeout(this.bezelTimeout);
            if (this.isPlaying) {
              currentVideo.onpause = null;
              currentVideo.onpause = () => {
                if (currentVideo.paused)
                  currentVideo.play().then(() => {
                    if (currentVideo.paused) currentVideo.play();
                  });
                currentVideo.onpause = null;
                this.bezelTimeout = setTimeout(() => {
                  if (document.body) document.body.removeAttribute("ytme-hide");
                }, 350);
              };
            } else {
              currentVideo.onplay = null;
              currentVideo.onplay = () => {
                if (!currentVideo.paused) currentVideo.pause();
                currentVideo.onplay = null;
                this.bezelTimeout = setTimeout(() => {
                  if (document.body) document.body.removeAttribute("ytme-hide");
                }, 350);
              };
            }
          }
        }
      }
      // 핀치 이벤트
    } else if (
      this.isScale &&
      this.isTouchEvent(event) &&
      event.touches.length === 2
    ) {
      const firstTouch = event.touches[0];
      const secondTouch = event.touches[1];
      // 늘어난 두 손가락간 거리
      const dist = Math.hypot(
        firstTouch.clientX - secondTouch.clientX,
        firstTouch.clientY - secondTouch.clientY
      );
      // 대상의 현재 offset 값을 얻기 위해
      let rec = this.targetElement.getBoundingClientRect();
      // 두 손가락의 중앙값을 구합니다.
      let pinchCenterX =
        ((firstTouch.clientX + secondTouch.clientX) / 2 - rec.left) /
        this.ts.getValue().scale;
      let pinchCenterY =
        ((firstTouch.clientY + secondTouch.clientY) / 2 - rec.top) /
        this.ts.getValue().scale;

      // 변경전 실제 길이값, ( 회전할 경우를 width,height값의 기준이 변경되므로 offsetWidth를 쓰지않는다.)
      const beforeTargetSize = {
        w: Math.round(rec.width / this.ts.getValue().scale),
        h: Math.round(rec.height / this.ts.getValue().scale),
      };
      // 변경전의 대각선 길이 값
      const mapDist = Math.hypot(
        beforeTargetSize.w * this.ts.getValue().scale,
        beforeTargetSize.h * this.ts.getValue().scale
      );

      // 변경되는 크기의 대각선 길이값 x값을 구합니다.
      const x = (mapDist * dist) / this.startDist;
      // 스케일로 변환 * 이전 스케일
      const scale = (x / mapDist) * this.startScale;
      // 위 두줄은 ((mapDist * dist) / this.startDist / mapDist) * this.startScale 와 같다

      // 최대 최소값
      const restrictScale = Math.min(
        Math.max(this.minScale, scale),
        this.maxScale
      );
      // 증가/감소분
      const factor = restrictScale - this.ts.getValue().scale;
      // 증가/감소 여부와 중심축 부터 증감하기 위해 미리  2로 나눈다
      const m = factor > 0 ? factor / 2 : factor / 2;

      // 이동할 실제 좌표값을 구합니다. 증가/감소분분 만큼을 곱한후 현재 값에 더함
      const nextTranslateX = this.ts.getValue().translate.x + -(pinchCenterX * m * 2) + beforeTargetSize.w * m;
      const nextTranslateY = this.ts.getValue().translate.y + -(pinchCenterY * m * 2) + beforeTargetSize.h * m;

      const nextTranslate = this.restrictXY({
        x: nextTranslateX,
        y: nextTranslateY,

      });
      // 스케일 업데이트
      const nextScale = restrictScale;
      // 좌표 업데이트
      this.setTransformValue({
        ...this.getTransformValue(),
        translate: nextTranslate,
        scale: nextScale,
      });
    }

    // 중첩 실행 문제 (성능) 해결 :: 굳이 할 필요없음.
    if (this.eventElement) {
      this.eventElement.ontouchmove = func;
    } else {
      this.targetElement.ontouchmove = func;
    }
  };
  private onEnd = (event: TouchEvent | MouseEvent) => {
    const eventTarget = this.eventElement ?? this.targetElement;
    if (this.isTouchEvent(event)) {
      eventTarget.removeEventListener("touchmove", this.onMove);
      eventTarget.removeEventListener("touchend", this.onEnd);
    } else {
      eventTarget.removeEventListener("mousemove", this.onMove);
      eventTarget.removeEventListener("mouseup", this.onEnd);
      eventTarget.removeEventListener("mouseleave", this.onEnd);
    }

    cancelAnimationFrame(this.inertiaAnimationFrame);
    if (this.dragged && this.isDrag) {
      this.dragFinish();
    }
    this.dragged = false;
    this.isDrag = false;
    this.isScale = false;
  };
  onWheel = (event: WheelEvent) => {
    if (!this.targetElement) return;
    event.preventDefault();

    let func = this.eventElement
      ? this.eventElement.onwheel
      : this.targetElement.onwheel;
    this.targetElement.onwheel = null;

    let rec = this.targetElement.getBoundingClientRect();
    let pointerX = (event.clientX - rec.left) / this.ts.getValue().scale;
    let pointerY = (event.clientY - rec.top) / this.ts.getValue().scale;

    let delta = -event.deltaY;
    if (this.ts.getValue().scale === this.maxScale && delta > 0) {
      return;
    }
    // factor를 지정 안하고 delta값 만큼 키운 후 factor를 구하는 경우
    // const mapSize = this.targetElement.offsetWidth * this.ts.scale
    // const nextSize = mapSize + delta
    // const scale = (nextSize / mapSize) * this.ts.scale
    // const restrictScale = Math.min(
    //   Math.max(this.minScale, scale),
    //   this.maxScale
    // )
    // const factor = restrictScale - this.ts.scale
    // const m = factor > 0 ? factor / 2 : factor / 2
    // this.ts.scale = restrictScale

    const beforeTargetSize = {
      w: Math.round(rec.width / this.ts.getValue().scale),
      h: Math.round(rec.height / this.ts.getValue().scale),
    };
    const factor = this.factor * this.ts.getValue().scale;

    let nextScale = delta > 0 ? this.ts.getValue().scale + factor : this.ts.getValue().scale - factor;
    nextScale = Math.min(
      Math.max(this.minScale, nextScale),
      this.maxScale
    );
    let m = delta > 0 ? factor / 2 : -(factor / 2);
    if (nextScale <= this.minScale && delta < 0) {
      return;
    }

    const nextTranslateX = this.ts.getValue().translate.x + -pointerX * m * 2 + beforeTargetSize.w * m;
    const nextTranslateY = this.ts.getValue().translate.y + -pointerY * m * 2 + beforeTargetSize.h * m;
    const nextTranslate = this.restrictXY({
      x: nextTranslateX,
      y: nextTranslateY,
    });
    this.setTransformValue({
      ...this.getTransformValue(),
      translate: nextTranslate,
      scale: nextScale,
    });
    if (this.eventElement) {
      this.eventElement.onwheel = func;
    } else {
      this.targetElement.onwheel = func;
    }
  };
}