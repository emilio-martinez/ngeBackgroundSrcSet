import {
  Directive,
  EventEmitter,
  HostBinding,
  Input,
  NgModule,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { filter, scan, takeUntil } from 'rxjs/operators';

const backgroundSrc = 'ngeBackgroundSrc';
const backgroundSrcSet = 'ngeBackgroundSrcSet';
const backgroundSizes = 'ngeBackgroundSizes';

const srcSetRegexp = /^(?:\s*\S+\s\d+[wx],?)+$/;

interface NgeBackgroundSrcSetConfig {
  src?: string;
  srcset?: string;
  sizes?: string;
}

@Directive({
  selector: '[' + backgroundSrc + '][' + backgroundSrcSet + ']'
})
export class NgeBackgroundSrcSetDirective implements OnChanges, OnDestroy, OnInit {
  /** Image `src`. See https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement. */
  @Input(backgroundSrc) src: string;
  /** Image `srcset`. See https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement. */
  @Input(backgroundSrcSet) srcset: string;
  /** Image `sizes`. See https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement. */
  @Input(backgroundSizes) sizes: string;
  /** Emitted when background changes */
  @Output() backgroundChange = new EventEmitter<void>();

  @HostBinding('style.backgroundImage') _attrBackgroundImage: string;

  /** Captures an input stream */
  private _input$ = new BehaviorSubject<NgeBackgroundSrcSetConfig>({});

  /** Local state based on src and srcset inputs */
  private _state$: Observable<NgeBackgroundSrcSetConfig> = this._input$.pipe(
    scan((acc, val) => Object.assign({}, acc, val)),
    filter(c => typeof c.src === 'string' && srcSetRegexp.test(c.srcset))
  );

  /** Destroy stream. To be triggered on directive destroy */
  private _destroy = new Subject<void>();

  /**
   * Image element being tracked.
   * On setting this value, image 'load' events will start being listened to
   */
  private set _img(img: HTMLImageElement) {
    if (!img) return;

    // Terminate previous subscription
    if (this._load$) {
      this._load$.unsubscribe();
    }

    this.__img = img;

    // Subscribe to new image 'load' events
    // Update will be called on 'load'
    this._load$ = fromEvent(img, 'load')
      .pipe(takeUntil(this._destroy))
      .subscribe(this._update.bind(this));

    // Additonaly, update if image load is already complete
    if (img.complete) {
      this._update();
    }
  }
  private get _img() {
    return this.__img;
  }
  private __img: HTMLImageElement;

  /** The image 'load' event subscription */
  private _load$: Subscription;

  ngOnChanges(changes: SimpleChanges): void {
    // SimpleChanges will be mapped to their current values and emitted on the input stream
    const mapped = Object.keys(changes)
      .reduce<NgeBackgroundSrcSetConfig>((acc, key) => {
        acc[key] = changes[key].currentValue;
        return acc
      }, {});

    this._input$.next(mapped);
  }

  ngOnInit() {
    // Listen for config changes
    this._state$
      .pipe(takeUntil(this._destroy))
      .subscribe(this._configChange.bind(this));
  }

  ngOnDestroy() {
    // Emit destroy
    this._destroy.next();
  }

  /**
   * Handles a config change
   * Will create a new iamge element, setting soruces accordingly
   */
  private _configChange(config: NgeBackgroundSrcSetConfig) {
    const img = new Image();
    img.srcset = config.srcset;
    img.src = config.src;
    img.sizes = typeof config.sizes === 'string' ? config.sizes : '';
    this._img = img;
  }

  /** Triggers an update to the current source */
  private _update(): void {
    const src = this._img.currentSrc || this._img.src;
    const backgroundImage = `url(${src})`;

    if (this._attrBackgroundImage !== backgroundImage) {
      this._attrBackgroundImage = backgroundImage;
      this.backgroundChange.next();
    }
  }
}

@NgModule({
  declarations: [NgeBackgroundSrcSetDirective],
  exports: [NgeBackgroundSrcSetDirective]
})
export class NgeBackgroundSrcSetModule { }
