import { CURRENT_PROTOCOL_VERSION, type Protocol } from '.'
import type {
    ReflectionEntry,
    SaveFile,
    EncryptedSaveFile,
    ProtocolVersion,
    ParsedLink,
} from '$lib/types'
import { minifyJSONArrays } from '$lib/utils'
import { reviveTimestamps } from '$lib/import'
import { base64url } from 'rfc4648'
import { encodeReflectionEntries } from '$lib/export'

const formatHeader = ({
    encrypted,
    protocolVersion,
}: {
    encrypted: boolean
    protocolVersion: ProtocolVersion
}) => `${encrypted ? '1' : '0'}e${protocolVersion}p`

/**
 * Generate a URI fragment (hash) representing user data.
 * Also adds a header to make it possible to know how to parse different links.
 * For example the header "0e2p" means "0e" = no encryption, and "2p" = protocol version 2.
 * Similarly "1e2p" means "1e" = the data is encrypted, and "2p" = protocol version 2.
 */
const formatLink = ({ data, encrypted = false }: { data: Uint8Array; encrypted?: boolean }) =>
    formatHeader({ encrypted, protocolVersion: CURRENT_PROTOCOL_VERSION }) +
    base64url.stringify(data)

export const parseLink = (link: string): ParsedLink => {
    /**
     * Link header example: "1e1p" means encryption enabled, and protocol version 1
     */
    const match = link.match(/^([10])e(\d+)p/)
    if (!match) throw new Error(`Invalid header: ${link}`)

    // Remove the header to get the data.
    const rawData = link.replace(match[0], '')
    if (!rawData) throw new Error(`Empty data: ${link}`)

    return {
        encrypted: match[1] === '1',
        protocolVersion: parseInt(match[2], 10) as ProtocolVersion,
        data: base64url.parse(rawData),
    }
}

export default {
    exportFile(data: ReflectionEntry[]) {
        const file: SaveFile = {
            type: 'lifewheel',
            version: CURRENT_PROTOCOL_VERSION,
            url: window.location.href,
            data,
            encrypted: false,
        }

        return new Blob([minifyJSONArrays(JSON.stringify(file, null, 2))], {
            type: 'application/json',
        })
    },
    // exportEncryptedFile(data: ReflectionEntry[]): EncryptedSaveFile
    exportLink(data: ReflectionEntry[]) {
        return formatLink({ data: encodeReflectionEntries(data), encrypted: false })
    },
    // exportEncryptedLink(data: ReflectionEntry[]): string
    importFile(file: SaveFile) {
        return reviveTimestamps(file.data)
    },
    // importEncryptedFile(file: EncryptedSaveFile): ReflectionEntry[]
    importLink(link: string) {},
    // importEncryptedLink(link: string): ReflectionEntry[]
} // TODO: Re-enable satisfies Protocol
