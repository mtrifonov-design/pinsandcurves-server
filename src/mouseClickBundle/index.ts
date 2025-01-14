import * as mouseclick_markasclickable from './markClickableTags'
import * as mouseclick_markasmousecursor from './markMouseCursorTags'
import * as mouseclick_markasmousepath from './markMousePathTags'
import * as mouseclick from './main'


let extensions = [
    mouseclick_markasclickable,
    mouseclick_markasmousecursor,
    mouseclick_markasmousepath,
    mouseclick,
]




export { extensions };