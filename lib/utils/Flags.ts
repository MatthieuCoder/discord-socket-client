/**
 * @author MatthieuCoder
 * @description Represents a flags objects from the discord api.
 **/

/**
 * Define the flag struct.
 */
export type Flag = {
    bit: number,
    name?: string | undefined,
    friendlyName?: string | undefined
}

export class FlagsManager {

    /**
     * The current value of the object
     */
    private _bitValue: number
    /**
     * The possible values for the object
     */
    private readonly _possibleFlags: { bit: number, name: string, friendlyName: string }[]

    public constructor(value: number, possibleFlags: { bit: number, name: string, friendlyName: string }[]) {
        this._bitValue = value;
        this._possibleFlags = possibleFlags;
    }

    /**
     * Add a flag to the current object.
     * @param flags
     */
    public addFlag(...flags: Flag[]) {
        const match = (partialFlag: Flag) =>
            this._possibleFlags.some(completeFlag =>
                partialFlag.bit === completeFlag.bit
                || partialFlag.friendlyName === completeFlag.friendlyName
                || partialFlag.name === completeFlag.name)

        for (const flag of flags) {
            if (match(flag)) {
                this._bitValue |= flag.bit
            }
        }
    }

    /**
     * Check if the current object have a certain flag.
     * @param flags
     */
    public hasFlag(...flags: Flag[]) {
        const find = (partialFlag: Flag) =>
            this._possibleFlags.findIndex(completeFlag =>
                partialFlag.bit === completeFlag.bit
                || partialFlag.friendlyName === completeFlag.friendlyName
                || partialFlag.name === completeFlag.name)

        for (const flag of flags) {
            const completeFlagIndex = find(flag)
            if (completeFlagIndex === -1 || (this._bitValue & this._possibleFlags[completeFlagIndex].bit) !== this._possibleFlags[completeFlagIndex].bit) {
                return false
            }
        }
        return true
    }

    /**
     * Get all the flags of the object.
     */
    public getFlags(): Flag[] {
        const returns = []
        for (const possibleFlag of this._possibleFlags) {
            if (this.hasFlag(possibleFlag))
                returns.push(possibleFlag)
        }
        return returns
    }
}

export default FlagsManager
module.exports = FlagsManager