export interface Capability {
    id: string;
    title: string;

    /**
     * The Capability's identifying colour
     * (hex). Used to tint the Capability
     * itself and every System that belongs
     * to it, consistently across the app.
     */
    color: string;
}