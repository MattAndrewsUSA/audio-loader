Okay, let's outline where the custom plugin code would go. Creating a Capacitor plugin involves several pieces:

1.  Generating the Plugin Boilerplate: You first generate the basic structure.

2.  Defining the Interface (TypeScript): What methods will your plugin have?

3.  Implementing the Web Version (TypeScript): Usually a fallback or throws an error if native-only.

4.  Implementing the Native iOS Version (Swift): The core logic using native APIs.

5.  Registering the Plugin (Objective-C): Making the native code accessible.

6.  Installing the Plugin in Your App: Linking it to your main FaxCam project.

7.  Using the Plugin in Your App (JavaScript): Calling the plugin from audioFax.js.


Steps & File Locations:

1. Generate Plugin (In a separate folder OR within your project):

It's often cleaner to create the plugin in a separate directory outside your FaxCam project first. Open your terminal, cd to a location outside FaxCam, and run:

npm init @capacitor/plugin


Follow the prompts:

* Plugin name: AudioLoader (or similar)

* Package ID: com.yourdomain.audioloader (replace with your identifier)

* Class name: AudioLoader

* Author, License, Repo URL: Fill as needed.

This creates a new folder (e.g., audio-loader) with the plugin structure.
url https://github.com/MattAndrewsUSA/AudioLoader


2. Define Interface (my-audio-loader/src/definitions.ts):

This file defines what methods your JavaScript code can call.

export interface MyAudioLoaderPlugin {
  /**
   * Loads a sound file from the app bundle's web assets.
   * @param options - Must include the filename.
   * @returns A promise resolving with the base64 encoded data of the file.
   * @rejects If the file cannot be found or read.
   */
  loadBundledSound(options: { filename: string }): Promise<{ base64Data: string }>;
}

3. Implement Web Version (my-audio-loader/src/web.ts):

* Since this is specifically for the iOS native issue, the web version can just throw an error.

import { WebPlugin } from '@capacitor/core';
import type { MyAudioLoaderPlugin } from './definitions';

export class MyAudioLoaderWeb extends WebPlugin implements MyAudioLoaderPlugin {
  async loadBundledSound(options: { filename: string }): Promise<{ base64Data: string }> {
    console.warn('MyAudioLoader is primarily for native platforms.', options);
    throw this.unimplemented('loadBundledSound - Not implemented on web.');
  }
}

4. Implement Native iOS Version (my-audio-loader/ios/Plugin/MyAudioLoaderPlugin.swift):

* THIS IS THE CORE FIX. This Swift code uses reliable native APIs to find the file within the .app bundle.


import Foundation
import Capacitor

@objc(MyAudioLoaderPlugin)
public class MyAudioLoaderPlugin: CAPPlugin {

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
                print("MyAudioLoaderPlugin: Found file via direct path: \(directPath)")
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
                 print("MyAudioLoaderPlugin: File not found using Bundle.main.url or direct path.")
                 call.reject("File '\(filename)' not found in bundle directory '\(soundsDirectory)'")
                 return
            }
        }

        // If Bundle.main.url succeeded:
         print("MyAudioLoaderPlugin: Found file via Bundle.main.url: \(bundledUrl.path)")
        do {
            let fileData = try Data(contentsOf: bundledUrl)
            let base64Data = fileData.base64EncodedString()
            call.resolve(["base64Data": base64Data])
        } catch {
            call.reject("Failed to read file data from URL \(bundledUrl.path)", nil, error)
        }
    }
}

5. Register Plugin (my-audio-loader/ios/Plugin/MyAudioLoaderPlugin.m):

* Make sure this file correctly registers your method.

#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(MyAudioLoaderPlugin, "MyAudioLoader",
           CAP_PLUGIN_METHOD(loadBundledSound, CAPPluginReturnPromise);
)

6. Install Plugin in FaxCam:

* cd back to your FaxCam project root.

Install the local plugin using its path:

# Replace ../my-audio-loader with the actual relative path to your plugin folder
npm install ../my-audio-loader

(Alternatively, publish it privately or use npm link)

7. Use Plugin in FaxCam/src/js/audioFax.js:

// audioFax.js - Using Custom Plugin

// ** STEP 1: Add Import for your custom plugin **
// (Replace 'my-audio-loader' if your package name is different)
import { MyAudioLoader } from 'my-audio-loader';

// Remove Capacitor Core/Filesystem imports if no longer needed elsewhere in this file
// import { Capacitor } from '@capacitor/core';
// import { Filesystem, Directory } from '@capacitor/filesystem';


export class FaxMechanicalSounds {
    // ... (constructor and other methods from your latest audioFax.js) ...
    #loadPromise = null; // Keep this

    // ... (keep the LATEST initAudio function) ...
    async initAudio() { /* ... your latest working version ... */ }

    // ... (keep the LATEST ensureAudioReady function) ...
    async ensureAudioReady() { /* ... your latest working version ... */ }

    // ... (keep _unlockAudio) ...
    async _unlockAudio() { /* ... */ }


* * * * *  * * *  * * *  * * *  * * *  * * *  * * *  * * *  * * *  * * *  * * *  * * *  * * *  * * *  * * *  * * *  * * *  * * *  * * *  * * *  * * *  * * *  * * *  * * *  *

// ** STEP 2: REPLACE the entire _loadAudioFiles function with this one **
    async _loadAudioFiles() {
        console.log('Loading audio files...');
        if (!this.audioContext) {
             console.error("Audio context not initialized for loading files.");
             return false;
        }

        const soundFiles = {
            send: 'Send.mp3',
            handshake: 'Handshake.mp3',
            receive: 'Receive.mp3',
            end: 'End.mp3'
        };
        let loadPromises; // Will hold promises for loading files

        // Check for Capacitor *inside* the function
        // Use global Capacitor object to avoid top-level import issues
        const CapacitorGlobal = window.Capacitor;
        const isNativeIOS = CapacitorGlobal?.isNativePlatform?.() && CapacitorGlobal?.getPlatform?.() === 'ios';

        // Use Conditional Logic
        if (isNativeIOS) {
            // ------------- NATIVE iOS (Use Custom Plugin) -------------
            console.log('Loading audio files using MyAudioLoader plugin (Native iOS)...');

             // Check if the custom plugin seems available
             if (!MyAudioLoader) {
                   console.error("MyAudioLoader plugin not found! Cannot load audio natively.");
                   // Fallback or throw error - for now, let Promise.all handle empty loadPromises
                   loadPromises = []; // Ensure loadPromises is an empty array
             } else {
                  // Create promises for each file using the custom plugin
                  loadPromises = Object.entries(soundFiles).map(async ([key, filename]) => {
                      try {
                          console.log(`[MyAudioLoader] Requesting ${filename}`);
                          // Call the custom plugin
                          const result = await MyAudioLoader.loadBundledSound({ filename: filename });
                          const base64Data = result.base64Data;

                          // --- Conversion logic from Base64 ---
                          const byteString = atob(base64Data);
                          const len = byteString.length;
                          const bytes = new Uint8Array(len);
                          for (let i = 0; i < len; i++) {
                              bytes[i] = byteString.charCodeAt(i);
                          }
                          // --- End Conversion ---

                          // Decode the audio data and return it with the key
                          return [key, await this.audioContext.decodeAudioData(bytes.buffer)];

                      } catch (error) {
                           console.error(`[MyAudioLoader] Failed to load ${filename}:`, error);
                           throw error; // Propagate error
                      }
                  }); // End of .map()
             } // End of if/else checking MyAudioLoader existence

        } else {
            // ------------- WEB & ANDROID (Use Fetch) -------------
            console.log('Loading audio files using fetch (Web/Android)...');
            // Create promises for each file using fetch
            loadPromises = Object.entries(soundFiles).map(async ([key, filename]) => {
                 const path = `assets/sounds/${filename}`; // Relative path for fetch
                 try {
                     console.log(`[Fetch] Trying path: ${path}`);
                     const response = await fetch(path);
                     if (!response.ok) {
                          console.error(`[Fetch] HTTP error for ${path}: ${response.status} ${response.statusText}`);
                          throw new Error(`HTTP error! status: ${response.status}`);
                     }
                     const arrayBuffer = await response.arrayBuffer();
                     return [key, await this.audioContext.decodeAudioData(arrayBuffer)];
                 } catch (error) {
                      console.error(`[Fetch] Failed fetch for ${path}:`, error);
                      throw error;
                 }
             }); // End of .map()

        } // End of if/else checking platform

        // ------------- COMMON PROCESSING -------------
        try {
             console.log("[_loadAudioFiles] Awaiting Promise.all...");
             const buffers = await Promise.all(loadPromises || []); // Use empty array if loadPromises is undefined/null
             console.log("[_loadAudioFiles] Promise.all resolved.");

             // Check if buffers array is empty (might happen if plugin check failed)
             if (buffers.length === 0 && isNativeIOS) {
                 throw new Error("Load promises array was empty for native iOS path.");
             }

             // Store the successfully decoded buffers
             this.audioBuffers = Object.fromEntries(buffers);
             console.log("[_loadAudioFiles] Assigned this.audioBuffers:", this.audioBuffers);

             // Check if the assignment worked and buffers exist
             if (Object.keys(this.audioBuffers).length !== Object.keys(soundFiles).length ||
                 !this.audioBuffers.send || !this.audioBuffers.handshake || !this.audioBuffers.receive || !this.audioBuffers.end)
             {
                  console.error("[_loadAudioFiles] Buffers missing or incomplete after assignment!", this.audioBuffers);
                  throw new Error("One or more audio files failed to load/decode (assignment check).");
             }

             // Ensure masterGain exists
             if (!this.masterGain && this.audioContext) {
                  this.masterGain = this.audioContext.createGain();
                  this.masterGain.gain.value = 0.3; // Use original value
                  this.masterGain.connect(this.audioContext.destination);
             }

             console.log('Audio files loaded and decoded successfully for platform.');
             return true; // Overall success

         } catch(error) {
              console.error('Error processing audio file loading results:', error);
              this.audioBuffers = { send: null, handshake: null, receive: null, end: null };
              return false; // Overall failure
         }
    } // End of _loadAudioFiles

    // ... (keep the LATEST ensureAudioContext function) ...
    async ensureAudioContext() { /* ... your latest working version ... */ }

    // ... (keep the LATEST _playBuffer function, including logging/gain fixes) ...
    async _playBuffer(buffer, volume = 1.0, callback = null) { /* ... your latest working version ... */ }

    // ... (keep the LATEST versions of startScanning, playMechanicalClick, etc., using ensureAudioReady) ...
    async startScanning() { /* ... */ }
    async playMechanicalClick() { /* ... */ }
    async startSending() { /* ... */ }
    async startReceiving() { /* ... */ }
    async playReceiveClick() { /* ... */ }
    async playEndSound() { /* ... */ }
    async playDTMFTone(key, duration = 0.15) { /* ... */ }

    // ... (keep stopAllSounds, _createDataSound) ...
    stopAllSounds() { /* ... */ }
    _createDataSound(volume = 0.18) { /* ... */ }

} // End of class

* * * * * * * * * * * * * * * * * * * * * * * * * * *

function isIOS() {
    // ... (keep isIOS function) ...
}



Summary of Changes in this _loadAudioFiles:

1. Import Added: import { MyAudioLoader } from 'my-audio-loader';

2. Native iOS Block Changed: Instead of using Filesystem.readFile, it now calls await MyAudioLoader.loadBundledSound({ filename: filename });.

3. Data Conversion: It takes the base64Data returned by the plugin and converts it to an ArrayBuffer using atob and Uint8Array.

4. Web/Android Block: Remains the same, using fetch.

5. Common Processing: Remains the same, handling the results from Promise.all.

6. Plugin Check: Added a basic check (if (!MyAudioLoader)) just in case the plugin isn't registered correctly.


