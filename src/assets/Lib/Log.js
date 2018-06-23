export default class LogInterface {
    /**
     *
     */
    constructor() {
        this.container = document.getElementById('logContainer');
    }

    /**
     *
     */
    clear() {
        this.container.innerHTML = '';
    }

    /**
     *
     */
    show() {
        this.container.classList.remove('hidden');
    }

    /**
     *
     */
    hide() {
        this.container.classList.add('hidden');
    }

    /**
     *
     * @param line
     */
    appendLine(line) {
        // Create paragraph
        let paragraph = document.createElement('p');

        // Clean the line and insert the line into the paragraph
        paragraph.innerHTML = this._cleanLine(line);

        // Add the paragraph to the logContainer
        this.container.appendChild(paragraph);

        // Scroll the container to the bottom
        this.scrollToBottom();
    }

    /**
     *
     */
    scrollToBottom() {
        this.container.scrollTo(0, this.container.scrollHeight);
    }

    /**
     *
     * @param line
     * @returns {*|string}
     * @private
     */
    _cleanLine(line) {
        return line.trim();
    }
}
