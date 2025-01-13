function serializeAndPrettifyXml(dom : Document) : string {
    const serializer = new XMLSerializer();
    let xmlString = serializer.serializeToString(dom);
    xmlString = xmlString.replace(/&quot;/g, "'");
    return prettifyXml(xmlString);
}

function prettifyXml(xmlString : string) : string {
    const PADDING = "  "; // define the indentation
    const regExp = /(>)(<)(\/*)/g;
    const formatted = xmlString
        .replace(regExp, "$1\n$2$3") // add newlines between tags
        .split("\n")
        .reduce((acc, line) => {
            const indentLevel = acc.indentLevel;
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("</")) {
                acc.indentLevel--;
            }
            acc.result.push(PADDING.repeat(acc.indentLevel) + trimmedLine);
            if (trimmedLine.endsWith(">") && !trimmedLine.startsWith("</") && !trimmedLine.endsWith("/>")) {
                acc.indentLevel++;
            }
            return acc;
        }, { result: [] as any, indentLevel: 0 })
        .result.join("\n");

    return formatted;
}

export default serializeAndPrettifyXml;