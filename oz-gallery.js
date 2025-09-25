class OzGallery extends HTMLElement {
	#index = -1;
	#current = null;
	#abortController = null;

	constructor() {
		super();
		this.attachShadow({mode:"open"}).innerHTML = HTML;

		this.#prev.addEventListener("click", _ => this.show(this.#index-1));
		this.#next.addEventListener("click", _ => this.show(this.#index+1));

		this.addEventListener("click", e => {
			let index = this.#links.findIndex(l => l.contains(e.target));
			if (index == -1) { return; }

			e.preventDefault();
			this.show(index);
		});

		this.#dialog.addEventListener("click", e => { // backdrop
			if (e.target == this.#dialog) { this.close(); }
		});

		window.addEventListener("keydown", e => {
			if (!this.#dialog.open) { return; }

			let index = keyToIndex(e.key, this.#index, this.#links.length);
			if (index === undefined) {
				return;
			} else if (index === null) {
				this.close();
			} else {
				this.show(index);
			}
		});

		window.addEventListener("resize", e => {
			if (this.#current && this.#current.localName == "little-planet") { syncPanoSize(this.#current); }
		});
	}

	show(index) {
		let len = this.#links.length;
		if (this.loop) { index = (index + len) % len; }

		if (index <= -1 || index >= len) { return; }

		if (this.#abortController) { this.#abortController.abort(); }
		if (!this.#dialog.open) { this.#dialog.showModal(); }

		let link = this.#links[index];
		switch (link.dataset.type || "image") {
			case "image": this.#showImage(link.href); break;
			case "pano": this.#showPano(link.href); break;
			case "youtube": this.#showYoutube(link.href); break;
		}

		this.#index = index;
		this.#prev.hidden = !this.loop && (index == 0);
		this.#next.hidden = !this.loop && (index+1 == len);
		this.dispatchEvent(new CustomEvent("change"));
	}

	#showContent(content) {
		this.#abortController = null;

		if (this.#current) {
			this.#current.replaceWith(content);
		} else {
			this.#dialog.append(content);
		}
		this.#current = content;
	}

	close() {
		if (!this.#dialog.open) { return; }
		if (this.#current) {
			this.#current.remove();
			this.#current = null;
		}
		this.#dialog.close();
		this.dispatchEvent(new CustomEvent("close"));
	}

	async #showImage(src) {
		let img = new Image();
		img.src = src;

		await this.#waitForEvent(img, "load");
		this.#showContent(img);
	}

	async #showYoutube(src) {
		let iframe = document.createElement("iframe");
		iframe.allowFullscreen = true;
		let url = new URL(src);
		let id;
		if (url.pathname == "/watch") {
			id = url.searchParams.get("v");
		} else if (url.pathname.startsWith("/shorts/")) {
			id = url.pathname.split("/").pop();
		} else {
			id = url.pathname.substring(1);
		}
		iframe.src = `https://www.youtube.com/embed/${id}`;
		this.#showContent(iframe);
	}

	async #showPano(src) {
		let pano = document.createElement("little-planet");
		pano.src = src;
		syncPanoSize(pano);
		await this.#waitForEvent(pano, "load");
		this.#showContent(pano);
	}

	#waitForEvent(node, event) {
		let ac = new AbortController();
		this.#abortController = ac;
		return waitForEvent(node, event, ac.signal);
	}

	get index() { return this.#index; }

	get #links() {
		let selector = this.selector || "a";
		return [...this.querySelectorAll(selector)];
	}
	get #prev() { return this.shadowRoot.querySelector(".prev"); }
	get #next() { return this.shadowRoot.querySelector(".next"); }
	get #dialog() { return this.shadowRoot.querySelector("dialog"); }

	get loop() { return this.hasAttribute("loop"); }
	set loop(loop) { loop ? this.setAttribute("loop", "") : this.removeAttribute("loop"); }

	get selector() { return this.getAttribute("selector"); }
	set selector(selector) { this.setAttribute("selector", selector); }
}

const HTML = `
<style>
* {
	box-sizing: border-box;
}

dialog {
	padding: 0;
	border: none;
	max-width: none;
	max-height: none;
}

dialog img, dialog little-planet {
	display: block;
	max-width: 100vw;
	max-height: 100vh;
	max-height: 100dvh;
}

dialog iframe {
	display: block;
	border: none;
	width: 80vw;
	aspect-ratio: 16 / 9;
}

dialog::backdrop {
	background-color: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(5px);
}

button {
	--height: 60px;
	--r: 4px;

	position: fixed;
	top: calc(50% - var(--height)/2);
	width: 48px;
	height: var(--height);

	cursor: pointer;
	border: none;
	font-family: monospace;
	font-weight: bold;
	font-size: 32px;
	background-color: rgba(0 0 0 / .3);
	color: #fff;

	transition: all .3s;
}

button:not(:hover) { opacity: 0.8; }

.prev {
	left: 0;
	border-radius: 0 var(--r) var(--r) 0;
}
.next {
	right: 0;
	border-radius: var(--r) 0 0 var(--r);
}

</style>
<slot></slot>
<dialog>
	<button class="prev">&lt;</button>
	<button class="next">&gt;</button>
</dialog>
`;

function keyToIndex(key, index, count) {
	switch (key) {
		case "ArrowLeft":
		case "ArrowUp":
		case "PageUp":
		case "Backspace": return index-1;

		case "ArrowRight":
		case "ArrowDown":
		case "PageDown":
		case "Enter":
		case " ": return index+1;

		case "Home": return 0;

		case "End": return count-1;
		case "Escape": return null;
	}
}

function waitForEvent(node, event, signal) {
	return new Promise(resolve => {
		node.addEventListener(event, resolve, {signal, once:true});
	});
}

function syncPanoSize(pano) {
	pano.width = innerWidth * devicePixelRatio;
	pano.height = innerHeight * devicePixelRatio;
}

customElements.define("oz-gallery", OzGallery);
