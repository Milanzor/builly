import Debounce from 'debounce';

export default class Favicon {

    /**
     *
     */
    constructor() {
        let linkTags = document.getElementsByTagName('link');
        this.iconEls = [];
        for (let i = 0; i < linkTags.length; i++) {
            let iconEl = linkTags[i];
            if (iconEl.rel.indexOf('icon') !== -1) {
                this.iconEls.push({el: iconEl, icon: iconEl.href});
            }
        }

        this.resetQueue = false;
    }

    /**
     *
     * @param icon
     */
    change(icon) {
        this._iconLoop(function (iconEl) {
            iconEl.el.href = icon;
        });
    }

    /**
     *
     * @param icon
     * @param time
     */
    blink(icon, time) {
        const self = this;
        Debounce(function () {
            time = time || 1000;
            self.change(icon);
            if (self.resetQueue !== false) {
                clearTimeout(self.resetQueue);
            }
            self.resetQueue = setTimeout(() => {
                self.reset();
            }, time);
        }, 100)();
    }

    reset() {
        this._iconLoop(function (iconEl) {
            iconEl.el.href = iconEl.icon;
        });
    }

    /**
     *
     * @param fn
     * @private
     */
    _iconLoop(fn) {
        for (let i = 0; i < this.iconEls.length; i++) {
            fn(this.iconEls[i]);
        }
    }

}
