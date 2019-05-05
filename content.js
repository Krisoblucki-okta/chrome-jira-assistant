class Utilities {
    static isInViewport(el) {
        let win = $(window);
        let element = $(el);
        let bounds = element.offset();
        let viewport = {
            top : win.scrollTop()
        }

        viewport.bottom = viewport.top + win.height();
        bounds.bottom = bounds.top + element.outerHeight();

        return (!(viewport.bottom < bounds.top || viewport.bottom < bounds.bottom || viewport.top > bounds.bottom || viewport.top > bounds.top));
    }
}

class ElementWatcher {
    constructor(element) {
        this.element = element;
    }

    watch() {
        let that = this;
        return new Promise((resolve, reject) => {
            let intervalId = setInterval(() => {
                if(Utilities.isInViewport(this.element)) {
                    clearInterval(intervalId);
                    resolve(this.element);
                }
            }, 500);
        });
    }
}

class ElementDecorator {
    constructor(element) {
        this.element = element;
    }

    decorate() {
        let issueId = $(this.element).find("a.ghx-key.js-key-link")[0].innerText;
        let that = this;
        $.get("https://oktainc.atlassian.net/rest/api/3/issue/" + issueId, (data) => {
            if(!data.fields.description) {
                return;
            }

            let firstParagraph = data.fields.description.content[0].content;
            let html = [];
            html.push("<div class='ghx-issue-content'>");
                html.push("<ul>");

                $.each(firstParagraph, (index, value) => {
                    if(value.type === 'text' && $.trim(value.text).length > 0) {
                        html.push("<li class='ghx-fa'>" + $.trim(value.text)  + "</li>");
                    }
                });

                html.push("</ul>");
            html.push("</div>");
            $(that.element).append(html.join(""));
        });
    }
}

$.each($("div.js-issue.ghx-backlog-card.ghx-newcard.js-sortable.js-parent-drag.ghx-issue-compact"), (index, value) => {
    if(Utilities.isInViewport(value)) {
        new ElementDecorator(value).decorate();
    }
    else {
        new ElementWatcher(value).watch().then((element) => {
            new ElementDecorator(element).decorate();
        });
    }
});