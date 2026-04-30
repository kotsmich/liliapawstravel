import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class JsonLdService {
  private readonly document = inject(DOCUMENT);

  set(id: string, schema: object): void {
    const head = this.document.head;
    let script = head.querySelector<HTMLScriptElement>(this.selectorFor(id));
    if (!script) {
      script = this.document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-jsonld-id', id);
      head.appendChild(script);
    }
    script.textContent = this.serialize(schema);
  }

  clear(id: string): void {
    const script = this.document.head.querySelector<HTMLScriptElement>(this.selectorFor(id));
    script?.remove();
  }

  private selectorFor(id: string): string {
    return `script[type="application/ld+json"][data-jsonld-id="${id}"]`;
  }

  // Escape "<" so an embedded "</script>" in user-supplied content can't terminate the
  // surrounding <script> tag. The escaped form is still valid JSON.
  private serialize(schema: object): string {
    return JSON.stringify(schema).replace(/</g, '\\u003c');
  }
}
