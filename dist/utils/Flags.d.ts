/**
 * @author MatthieuCoder
 * @description Represents a flags objects from the discord api.
 **/
/**
 * Define the flag struct.
 */
export declare type Flag = {
    bit: number;
    name?: string | undefined;
    friendlyName?: string | undefined;
};
export declare class FlagsManager {
    /**
     * The current value of the object
     */
    private _bitValue;
    /**
     * The possible values for the object
     */
    private readonly _possibleFlags;
    constructor(value: number, possibleFlags: {
        bit: number;
        name: string;
        friendlyName: string;
    }[]);
    /**
     * Add a flag to the current object.
     * @param flags
     */
    addFlag(...flags: Flag[]): void;
    /**
     * Check if the current object have a certain flag.
     * @param flags
     */
    hasFlag(...flags: Flag[]): boolean;
    /**
     * Get all the flags of the object.
     */
    getFlags(): Flag[];
}
export default FlagsManager;
