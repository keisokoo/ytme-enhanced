import { BehaviorSubject } from "rxjs"
import { TransformValueType } from "./types"
import { extractYouTubeId } from "./utils"

export const currentUrl = () => extractYouTubeId(window.location.href)

export const behaviorSubjects = {
  ytmeActive: new BehaviorSubject<{ youtubeId: string | null, isTheater: boolean }>({
    youtubeId: currentUrl(),
    isTheater: false,
  }),
  videoInfo: new BehaviorSubject<{ duration: number, width: number, height: number, aspect: number, type: 'vertical' | 'horizontal' | null }>({ duration: 0, width: 0, height: 0, aspect: 0, type: null }),
  transformValue: new BehaviorSubject<TransformValueType>({
    translate: { x: 0, y: 0 },
    scale: 1,
    rotate: 0,
    scaleX: 1,
  }),
  optionsActive: new BehaviorSubject<boolean>(false),
  theaterMode: new BehaviorSubject<boolean>(false),
  transformMode: new BehaviorSubject<boolean>(false),
  aToB: new BehaviorSubject<{ a: number | null, b: number | null, repeat: boolean }>({
    a: null,
    b: null,
    repeat: false,
  }),
}
