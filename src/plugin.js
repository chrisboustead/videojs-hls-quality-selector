import videojs from 'video.js';
import {version as VERSION} from '../package.json';

// Default options for the plugin.
const defaults = {};

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 *           A Video.js player object.
 *
 * @param    {Object} [options={}]
 *           A plain object containing options for the plugin.
 */
const onPlayerReady = (player, options) => {
  player.addClass('vjs-hls-quality-selector');
  player.hlsQualitySelector = new hlsQualitySelectorPlugin(player, options);
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function hlsQualitySelector
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const hlsQualitySelector = function(options) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(defaults, options));
  });
};

class hlsQualitySelectorPlugin {

  constructor (player, options) {
    this.player = player;

    // If there is quality levels plugin and the HLS tech exists
    // then continue.
    if(this.player.qualityLevels && this.getHls()) {
      // Create the quality button.
      this.createQualityButton();
      this.bindPlayerEvents();
    }
  }

  getHls () {
    return this.player.tech({ IWillNotUseThisInPlugins: true }).hls;
  }

  bindPlayerEvents() {
    this.player.qualityLevels().on('addqualitylevel', this.onAddQualityLevel.bind(this));
  }

  createQualityButton() {

    const player = this.player;
    const videoJsButtonClass = videojs.getComponent('MenuButton');
    const concreteButtonClass = videojs.extend(videoJsButtonClass, {

      constructor: function() {
        videoJsButtonClass.call(this, player, {title : player.localize('Quality')});
      },
      createItems : function() {
        return [];
      }
    });

    this._qualityButton = new concreteButtonClass();

    const placementIndex = player.controlBar.children().length - 2;
    const concreteButtonInstance = player.controlBar.addChild(this._qualityButton, {componentClass: 'qualitySelector'}, placementIndex);
    concreteButtonInstance.addClass("vjs-quality-selector");
    concreteButtonInstance.addClass("vjs-icon-hd");
    concreteButtonInstance.removeClass("vjs-hidden");

  };


  getQualityMenuItem (item) {
    const self = this;
    const player = this.player;
    const videoJsMenuItemClass = videojs.getComponent('MenuItem');
    const concreteMenuItemClass = videojs.extend(videoJsMenuItemClass, {
      constructor: function() {
        videoJsMenuItemClass.call(this, player, {
          label: item.label,
          selectable: true,
          selected: item.selected || false
        });
      },
      handleClick : function(event){

        // Reset other menu items selected status.
        for(let i = 0; i < self._qualityButton.items.length; ++i) {
          self._qualityButton.items[i].selected(false);
        }

        // Set this menu item to selected, and set quality.
        self.setQuality(item.value);
        this.selected(true);

      }
    });
    return new concreteMenuItemClass();
  };


  onAddQualityLevel(event) {

    const player = this.player;
    const qualityList = player.qualityLevels();
    const levels = qualityList.levels_ || [];
    const levelItems = [];

    for(let i = 0; i < levels.length; ++i) {
      const levelItem = this.getQualityMenuItem.call(this, {
        label: levels[i].height + 'p',
        value: levels[i].height
      });
      levelItems.push(levelItem);
    }

    levelItems.push(this.getQualityMenuItem.call(this, {
      label: 'Auto',
      value: 'auto',
      selected: true
    }));

    if(this._qualityButton) {
      this._qualityButton.createItems = function(){
        return levelItems;
      };
      this._qualityButton.update();
    }

  };

  setQuality(height){
    const qualityList = this.player.qualityLevels();
    for(let i = 0; i < qualityList.length; ++i) {
      const quality = qualityList[i];
      quality.enabled = (quality.height === height || height === 'auto');
    }
    this._qualityButton.unpressButton();
  };


}


// Register the plugin with video.js.
registerPlugin('hlsQualitySelector', hlsQualitySelector);

// Include the version number.
hlsQualitySelector.VERSION = VERSION;

export default hlsQualitySelector;
