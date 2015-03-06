/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "require";
    },

    process: function(leaf, state) {
        if(leaf.folder) {
            //TODO.
            //state.print("require('fs').readdirSync(path+'/').forEach(function(file){if(file.match(/.+\.js/g)!==null&&file!=='index.js')this[file.replace('.js','')]=require('./'+file)},this);");
        }
        else {
            if (leaf.kindExpression) {
                state.print("require");
                state.processor.leaf(leaf.kindExpression, state);
                state.println(";");
            }
            else {
                state.print("var");
                state.meaningfulSpace();
                state.print(leaf.name || leaf.kind);
                state.print(" = ");
                state.print("require('");
                state.print(leaf.kind);
                state.println("');");
            }
        }
    }

};