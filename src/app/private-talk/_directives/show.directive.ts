import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[show-dir]'
})
export class ShowDirective {

 
  constructor(public elementRef: ElementRef) { }

  @HostListener('mouseenter')
  onMouseEnter() {
    (this.elementRef.nativeElement as HTMLElement).classList.add('showDiv')
  }

  @HostListener('mouseleave') onMouseLeave() {
    (this.elementRef.nativeElement as HTMLElement).classList.remove('showDiv')
  }
}
