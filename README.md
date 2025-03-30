# audio-loader

Loads mp3s natively in ios

## Install

```bash
npm install audio-loader
npx cap sync
```

## API

<docgen-index>

* [`loadBundledSound(...)`](#loadbundledsound)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### loadBundledSound(...)

```typescript
loadBundledSound(options: { filename: string; }) => Promise<{ base64Data: string; }>
```

Loads a sound file from the app bundle's web assets.

| Param         | Type                               | Description                  |
| ------------- | ---------------------------------- | ---------------------------- |
| **`options`** | <code>{ filename: string; }</code> | - Must include the filename. |

**Returns:** <code>Promise&lt;{ base64Data: string; }&gt;</code>

--------------------

</docgen-api>
