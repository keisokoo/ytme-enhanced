import { BehaviorSubject } from "rxjs"
import { TransformValueType } from "./types"
import { extractYouTubeId } from "./utils"

export const currentUrl = () => extractYouTubeId(window.location.href)

export const behaviorSubjects = {
  ytmeActive: new BehaviorSubject<{ youtubeId: string | null, isTheater: boolean }>({
    youtubeId: currentUrl(),
    isTheater: false,
  }),
  activeCheck: new BehaviorSubject<string>(''),
  searchBoxFocused: new BehaviorSubject<boolean>(false),
  videoType: new BehaviorSubject<'vertical' | 'horizontal' | null>(null),
  videoAspectRatio: new BehaviorSubject<number | null>(null),
  videoDuration: new BehaviorSubject<number | null>(null),
  videoSize: new BehaviorSubject<{ width: number, height: number }>({ width: 0, height: 0 }),
  transformValue: new BehaviorSubject<TransformValueType>({
    translate: { x: 0, y: 0 },
    scale: 1,
    rotate: 0,
  }),
  optionsTsValue: new BehaviorSubject<TransformValueType>({
    translate: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    scale: 1,
    rotate: 0,
  }),
  optionsActive: new BehaviorSubject<boolean>(false),
  theaterMode: new BehaviorSubject<boolean>(false),
  translateMode: new BehaviorSubject<boolean>(false),
  aToB: new BehaviorSubject<{ a: number | null, b: number | null, repeat: boolean }>({
    a: null,
    b: null,
    repeat: false,
  }),
}