import { Model } from '@converse/skeletor/src/model.js';

class MinimizedChatsToggle extends Model {
    defaults () { // eslint-disable-line class-methods-use-this
        return {
            'collapsed': false
        }
    }
}

export default MinimizedChatsToggle;
