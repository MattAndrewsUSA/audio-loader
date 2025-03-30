import Foundation

@objc public class AudioLoader: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
