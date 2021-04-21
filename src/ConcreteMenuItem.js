import videojs from 'video.js';

// Concrete classes
const VideoJsMenuItemClass = videojs.getComponent('MenuItem');

/**
 * Extend vjs menu item class.
 */
export default class ConcreteMenuItem extends VideoJsMenuItemClass {

    /**
     * Menu item constructor.
     *
     * @param {Player} player - vjs player
     * @param {Object} item - Item object
     * @param {ConcreteButton} qualityButton - The containing button.
     * @param {HlsQualitySelectorPlugin} plugin - This plugin instance.
     */
  constructor(player, item, qualityButton, plugin) {
    super(player, {
      label: item.label,
      selectable: true,
      selected: item.selected || false
    });
    this.item = item;
    this.qualityButton = qualityButton;
    this.plugin = plugin;
  }

    /**
     * Click event for menu item.
     */
  handleClick() {
    // Set this menu item to selected, and set quality.
    this.plugin.setQuality(this.item.value);
  }
}
