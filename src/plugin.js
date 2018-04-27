import videojs from 'video.js';
import {version as VERSION} from '../package.json';

// Default options for the plugin.
const defaults = {};

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;

/**
 * VideoJS HLS Quality Selector Plugin class.
 */
class HlsQualitySelectorPlugin {

  /**
   * Plugin Constructor.
   *
   * @param {Player} player - The videojs player instance.
   * @param {Object} options - The plugin options.
   */
  constructor(player, options) {
    this.player = player;

    // If there is quality levels plugin and the HLS tech exists
    // then continue.
    if (this.player.qualityLevels && this.getHls()) {
      // Create the quality button.
      this.createQualityButton();
      this.bindPlayerEvents();
    }
  }

  /**
   * Returns HLS Plugin
   *
   * @return {*} - videojs-hls-contrib plugin.
   */
  getHls() {
    return this.player.tech({ IWillNotUseThisInPlugins: true }).hls;
  }

  /**
   * Binds listener for quality level changes.
   */
  bindPlayerEvents() {
    this.player.qualityLevels().on('addqualitylevel', this.onAddQualityLevel.bind(this));
  }

  /**
   * Adds the quality menu button to the player control bar.
   */
  createQualityButton() {

    const player = this.player;
    const videoJsButtonClass = videojs.getComponent('MenuButton');

    /**
     * Extend vjs button class for quality button.
     */
    class ConcreteButtonClass extends videoJsButtonClass {

      /**
       * Button constructor.
       */
      constructor() {
        super(player, {title: player.localize('Quality')});
      }

      /**
       * Creates button items.
       *
       * @return {Array} - Button items
       */
      createItems() {
        return [];
      }
    }

    this._qualityButton = new ConcreteButtonClass();

    const placementIndex = player.controlBar.children().length - 2;
    const concreteButtonInstance = player.controlBar.addChild(this._qualityButton,
      {componentClass: 'qualitySelector'},
      placementIndex);

    concreteButtonInstance.addClass('vjs-quality-selector');
    concreteButtonInstance
      .menuButton_.$('.vjs-icon-placeholder').className += ' vjs-icon-hd';
    concreteButtonInstance.removeClass('vjs-hidden');

  }

  /**
   * Builds individual quality menu items.
   *
   * @param {Object} item - Individual quality menu item.
   * @return {ConcreteMenuItemClass} - Menu item
   */
  getQualityMenuItem(item) {
    const player = this.player;
    const videoJsMenuItemClass = videojs.getComponent('MenuItem');

    /**
     * Extend vjs menu item class.
     */
    class ConcreteMenuItemClass extends videoJsMenuItemClass {

      /**
       * Menu item constructor.
       *
       * @param {Player} _player - vjs player
       * @param {Object} _item - Item object
       * @param {ConcreteButtonClass} qualityButton - The containing button.
       * @param {HlsQualitySelectorPlugin} _plugin - This plugin instance.
       */
      constructor(_player, _item, qualityButton, _plugin) {
        super(_player, {
          label: item.label,
          selectable: true,
          selected: item.selected || false
        });
        this.item = _item;
        this.qualityButton = qualityButton;
        this.plugin = _plugin;
      }

      /**
       * Click event for menu item.
       */
      handleClick() {

        // Reset other menu items selected status.
        for (let i = 0; i < this.qualityButton.items.length; ++i) {
          this.qualityButton.items[i].selected(false);
        }

        // Set this menu item to selected, and set quality.
        this.plugin.setQuality(this.item.value);
        this.selected(true);

      }
    }

    return new ConcreteMenuItemClass(player, item, this._qualityButton, this);
  }

  /**
   * Executed when a quality level is added from HLS playlist.
   */
  onAddQualityLevel() {

    const player = this.player;
    const qualityList = player.qualityLevels();
    const levels = qualityList.levels_ || [];
    const levelItems = [];

    for (let i = 0; i < levels.length; ++i) {
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

    if (this._qualityButton) {
      this._qualityButton.createItems = function() {
        return levelItems;
      };
      this._qualityButton.update();
    }

  }

  /**
   * Sets quality (based on media height)
   *
   * @param {number} height - A number representing HLS playlist.
   */
  setQuality(height) {
    const qualityList = this.player.qualityLevels();

    for (let i = 0; i < qualityList.length; ++i) {
      const quality = qualityList[i];

      quality.enabled = (quality.height === height || height === 'auto');
    }
    this._qualityButton.unpressButton();
  }

}

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
  player.hlsQualitySelector = new HlsQualitySelectorPlugin(player, options);
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

// Register the plugin with video.js.
registerPlugin('hlsQualitySelector', hlsQualitySelector);

// Include the version number.
hlsQualitySelector.VERSION = VERSION;

export default hlsQualitySelector;
