import { webMethod, Permissions } from 'wix-web-module';
import { customEmbeds } from '@wix/embeds';

/**
 * Read-only inventory for the draft embed replacement.
 * This is deliberately owner-only and does not create, update, enable,
 * disable, or delete any embed.
 */
export const listRabbitEmbeds = webMethod(Permissions.SiteOwner, async () => {
    const response = await customEmbeds.listCustomEmbeds();
    return response?.customEmbeds || response?.embeds || [];
});
