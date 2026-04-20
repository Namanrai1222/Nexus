export class Editor {
    constructor(elementId) {
        this.el = document.getElementById(elementId);
        if (!this.el) return;
        this.init();
    }

    init() {
        // Enforce basic P tags instead of divs if supported, else rely on manual
        document.execCommand("defaultParagraphSeparator", false, "p");
    }

    exec(command, value = null) {
        document.execCommand(command, false, value);
        this.el.focus();
    }

    bold() { this.exec('bold'); }
    italic() { this.exec('italic'); }
    strike() { this.exec('strikeThrough'); }
    h2() { this.exec('formatBlock', 'H2'); }
    h3() { this.exec('formatBlock', 'H3'); }
    quote() { this.exec('formatBlock', 'BLOCKQUOTE'); }
    ul() { this.exec('insertUnorderedList'); }
    ol() { this.exec('insertOrderedList'); }
    hr() { this.exec('insertHorizontalRule'); }
    
    code() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const text = selection.toString();
        this.exec('insertHTML', `<code>${text}</code>&nbsp;`);
    }

    codeBlock() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const text = selection.toString() || 'Code here';
        this.exec('insertHTML', `<pre><code>${text}</code></pre><p><br></p>`);
    }

    link() {
        const url = prompt('Enter URL:');
        if (url) this.exec('createLink', url);
    }

    image() {
        const url = prompt('Enter Image URL:');
        if (url) this.exec('insertImage', url);
    }

    getHTML() {
        return this.el.innerHTML;
    }

    getText() {
        return this.el.innerText || this.el.textContent;
    }

    setHTML(html) {
        this.el.innerHTML = html;
    }
}
