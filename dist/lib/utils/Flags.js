"use strict";
/**
 * @author MatthieuCoder
 * @description Represents a flags objects from the discord api.
 **/
exports.__esModule = true;
var FlagsManager = /** @class */ (function () {
    function FlagsManager(value, possibleFlags) {
        this._bitValue = value;
        this._possibleFlags = possibleFlags;
    }
    /**
     * Add a flag to the current object.
     * @param flags
     */
    FlagsManager.prototype.addFlag = function () {
        var _this = this;
        var flags = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            flags[_i] = arguments[_i];
        }
        var match = function (partialFlag) {
            return _this._possibleFlags.some(function (completeFlag) {
                return partialFlag.bit === completeFlag.bit
                    || partialFlag.friendlyName === completeFlag.friendlyName
                    || partialFlag.name === completeFlag.name;
            });
        };
        for (var _a = 0, flags_1 = flags; _a < flags_1.length; _a++) {
            var flag = flags_1[_a];
            if (match(flag)) {
                this._bitValue |= flag.bit;
            }
        }
    };
    /**
     * Check if the current object have a certain flag.
     * @param flags
     */
    FlagsManager.prototype.hasFlag = function () {
        var _this = this;
        var flags = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            flags[_i] = arguments[_i];
        }
        var find = function (partialFlag) {
            return _this._possibleFlags.findIndex(function (completeFlag) {
                return partialFlag.bit === completeFlag.bit
                    || partialFlag.friendlyName === completeFlag.friendlyName
                    || partialFlag.name === completeFlag.name;
            });
        };
        for (var _a = 0, flags_2 = flags; _a < flags_2.length; _a++) {
            var flag = flags_2[_a];
            var completeFlagIndex = find(flag);
            if (completeFlagIndex === -1 || (this._bitValue & this._possibleFlags[completeFlagIndex].bit) !== this._possibleFlags[completeFlagIndex].bit) {
                return false;
            }
        }
        return true;
    };
    /**
     * Get all the flags of the object.
     */
    FlagsManager.prototype.getFlags = function () {
        var returns = [];
        for (var _i = 0, _a = this._possibleFlags; _i < _a.length; _i++) {
            var possibleFlag = _a[_i];
            if (this.hasFlag(possibleFlag))
                returns.push(possibleFlag);
        }
        return returns;
    };
    return FlagsManager;
}());
exports.FlagsManager = FlagsManager;
exports["default"] = FlagsManager;
module.exports = FlagsManager;
