import Foundation
import Capacitor

@objc(AudioLoaderPlugin)
public class AudioLoaderPlugin: CAPPlugin {

    @objc func loadBundledSound(_ call: CAPPluginCall) {
        guard let filename = call.getString("filename") else {
            call.reject("Missing 'filename' option")
            return
        }

        // Construct the path within the 'public/assets/sounds' directory inside the main bundle
        let soundsDirectory = "public/assets/sounds" // This is where Capacitor copies web assets

        // Use Bundle.main.url(forResource:withExtension:subdirectory:) which is generally safer
        // Need to split filename into name and extension
        let fileURL = URL(fileURLWithPath: filename)
        let resourceName = fileURL.deletingPathExtension().lastPathComponent
        let resourceExtension = fileURL.pathExtension

        guard let bundledUrl = Bundle.main.url(forResource: resourceName,
                                               withExtension: resourceExtension,
                                               subdirectory: soundsDirectory) else {
            // Fallback: Try constructing path directly (less reliable but worth trying if subdirectory fails)
            let directPath = Bundle.main.bundlePath + "/" + soundsDirectory + "/" + filename
            if FileManager.default.fileExists(atPath: directPath) {
                print("AudioLoaderPlugin: Found file via direct path: \(directPath)")
                do {
                     let fileData = try Data(contentsOf: URL(fileURLWithPath: directPath))
                     let base64Data = fileData.base64EncodedString()
                     call.resolve(["base64Data": base64Data])
                     return
                } catch {
                     call.reject("Failed to read file at direct path \(directPath)", nil, error)
                     return
                }
            } else {
                 print("AudioLoaderPlugin: File not found using Bundle.main.url or direct path.")
                 call.reject("File '\(filename)' not found in bundle directory '\(soundsDirectory)'")
                 return
            }
        }

        // If Bundle.main.url succeeded:
         print("AudioLoaderPlugin: Found file via Bundle.main.url: \(bundledUrl.path)")
        do {
            let fileData = try Data(contentsOf: bundledUrl)
            let base64Data = fileData.base64EncodedString()
            call.resolve(["base64Data": base64Data])
        } catch {
            call.reject("Failed to read file data from URL \(bundledUrl.path)", nil, error)
        }
    }
}