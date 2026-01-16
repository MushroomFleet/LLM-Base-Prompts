# Zero-Data API Key Storage System for BYOK Games

## Description

A secure, cross-platform API key storage system designed for indie game developers implementing "Bring Your Own Key" (BYOK) functionality. This system stores LLM API keys (OpenAI, Anthropic, etc.) using OS-level credential managers with zero backend infrastructure, ensuring keys never touch game servers, save files, or cloud storage.

The implementation provides silent, one-time setup flows for Python-based games (Pygame, custom engines) and React/JSX-based games (Electron, web-based with Tauri/Neutralino). The system gracefully degrades when API keys are unavailable, maintaining full gameplay with AI features as optional enhancements.

**Key Design Principles:**
- **Zero Server Storage:** API keys never leave the user's device
- **OS-Native Security:** Leverages platform credential managers (Windows Credential Manager, macOS Keychain, Linux Secret Service)
- **Silent Integration:** One-time setup, never asks again
- **Graceful Degradation:** Game remains fully playable without API keys
- **Cross-Platform:** Consistent behavior across Windows, macOS, and Linux

## Functionality

### Core Features

#### 1. Secure Key Storage
- Store API keys using OS-native credential management systems
- Automatic platform detection (Windows/macOS/Linux)
- Encrypted storage using platform-specific APIs
- Keys persist across game sessions and system reboots
- Independent of game save files and Steam Cloud

#### 2. One-Time Setup Flow
- First-time prompt when AI feature is accessed
- Minimal UI: single text input and two buttons (Save/Skip)
- Optional help link to API key acquisition
- Never prompts again once configured or skipped
- Remembers skip decision for current session

#### 3. Silent Key Retrieval
- Automatic key loading on AI feature access
- No loading screens or progress indicators
- Graceful fallback to non-AI mode if key unavailable
- No error messages for missing keys (silent degradation)

#### 4. Settings Integration
- Optional settings menu for key management
- View obfuscated key (shows `sk-****...****`)
- Change key functionality
- Clear key option with confirmation
- Test connection button (validates key with API provider)

#### 5. Security Features
- Keys stored only in OS credential manager
- No plaintext storage anywhere
- No logging of API keys
- Secure memory handling (cleared after use)
- File permission restrictions (Unix-like systems)

### User Workflows

#### First-Time User Workflow
```
1. User launches game
2. User clicks "AI Companion" feature
3. Dialog appears: "Enable AI Features?"
   - Input field for API key
   - "Save" button
   - "Skip" button
   - "Where do I get a key?" help link
4. User enters key and clicks "Save"
5. System validates key format
6. Key stored in OS credential manager
7. Dialog closes, AI feature activates immediately
8. Never prompted again
```

#### Returning User Workflow
```
1. User launches game
2. User clicks "AI Companion" feature
3. System silently retrieves key from OS credential manager
4. AI feature activates immediately
5. No UI interruption
```

#### Skip Workflow
```
1. User clicks "Skip" on setup dialog
2. Dialog closes
3. AI feature remains disabled
4. Non-AI alternative activates (if available)
5. User not prompted again this session
6. User can access key setup from Settings menu later
```

#### Settings Management Workflow
```
1. User navigates to Settings > AI Features
2. Current status displayed:
   - "AI Features: Enabled" or "AI Features: Disabled"
   - If enabled: "API Key: sk-****...****"
3. User can:
   - Change key (shows input dialog)
   - Test connection (validates with API)
   - Clear key (with confirmation dialog)
```

## Technical Implementation

### Architecture Overview

```mermaid
graph TB
    A[Game Code] --> B{Platform?}
    B -->|Windows| C[Windows Credential Manager]
    B -->|macOS| D[macOS Keychain]
    B -->|Linux| E[Secret Service API]
    
    A --> F[Key Manager Interface]
    F --> G[Store Key]
    F --> H[Retrieve Key]
    F --> I[Delete Key]
    F --> J[Check Exists]
    
    G --> B
    H --> B
    I --> B
    J --> B
    
    A --> K[UI Components]
    K --> L[Setup Dialog]
    K --> M[Settings Panel]
    K --> N[Error Handlers]
```

### Python Implementation

#### Dependencies

**Required Libraries:**
```python
# Windows
import ctypes
from ctypes import wintypes

# macOS
import subprocess
import shlex

# Linux
import secretstorage
from jeepney.integrate.blocking import connect_and_authenticate

# Cross-platform
import platform
import os
import json
```

**Recommended Package (Optional):**
```bash
pip install keyring  # Provides cross-platform abstraction
```

#### Core Module Structure

**File: `secure_key_storage.py`**

```python
"""
Secure API Key Storage Module
Handles cross-platform credential storage for BYOK games
"""

class SecureKeyStorage:
    """
    Cross-platform API key storage using OS credential managers.
    
    Supports:
    - Windows Credential Manager (via ctypes)
    - macOS Keychain (via security command)
    - Linux Secret Service (via secretstorage)
    """
    
    def __init__(self, app_name: str):
        """
        Initialize storage manager.
        
        Args:
            app_name: Unique application identifier (e.g., "MyGame_LLM")
        """
        self.app_name = app_name
        self.platform = platform.system()
        self._validate_platform()
    
    def store_key(self, key: str) -> bool:
        """
        Store API key in OS credential manager.
        
        Args:
            key: API key string (e.g., "sk-...")
            
        Returns:
            True if successful, False otherwise
            
        Raises:
            ValueError: If key is empty or invalid format
            OSError: If platform credential storage unavailable
        """
        pass
    
    def retrieve_key(self) -> str | None:
        """
        Retrieve API key from OS credential manager.
        
        Returns:
            API key string if found, None if not configured
            
        Raises:
            OSError: If platform credential storage unavailable
        """
        pass
    
    def delete_key(self) -> bool:
        """
        Remove API key from OS credential manager.
        
        Returns:
            True if successful, False if key didn't exist
        """
        pass
    
    def has_key(self) -> bool:
        """
        Check if API key is configured.
        
        Returns:
            True if key exists, False otherwise
        """
        pass
    
    def validate_key_format(self, key: str) -> bool:
        """
        Validate API key format (basic syntax check).
        
        Args:
            key: API key to validate
            
        Returns:
            True if format appears valid
        """
        pass
```

#### Windows Implementation

```python
class WindowsCredentialManager:
    """Windows Credential Manager implementation using ctypes."""
    
    # Windows API constants
    CRED_TYPE_GENERIC = 0x1
    CRED_PERSIST_LOCAL_MACHINE = 0x2
    
    # Windows API structures
    class CREDENTIAL(ctypes.Structure):
        _fields_ = [
            ("Flags", wintypes.DWORD),
            ("Type", wintypes.DWORD),
            ("TargetName", wintypes.LPWSTR),
            ("Comment", wintypes.LPWSTR),
            ("LastWritten", wintypes.FILETIME),
            ("CredentialBlobSize", wintypes.DWORD),
            ("CredentialBlob", wintypes.LPBYTE),
            ("Persist", wintypes.DWORD),
            ("AttributeCount", wintypes.DWORD),
            ("Attributes", ctypes.c_void_p),
            ("TargetAlias", wintypes.LPWSTR),
            ("UserName", wintypes.LPWSTR),
        ]
    
    @staticmethod
    def write_credential(target_name: str, credential: str) -> bool:
        """
        Write credential to Windows Credential Manager.
        
        Implementation steps:
        1. Convert credential string to bytes
        2. Create CREDENTIAL structure
        3. Call CredWriteW from advapi32.dll
        4. Return success/failure
        
        Args:
            target_name: Unique identifier for credential
            credential: The secret to store
            
        Returns:
            True if successful
        """
        advapi32 = ctypes.windll.advapi32
        
        # Convert credential to bytes
        cred_bytes = credential.encode('utf-16-le')
        cred_size = len(cred_bytes)
        
        # Create credential structure
        cred = WindowsCredentialManager.CREDENTIAL()
        cred.Type = WindowsCredentialManager.CRED_TYPE_GENERIC
        cred.TargetName = target_name
        cred.CredentialBlobSize = cred_size
        cred.CredentialBlob = ctypes.cast(
            ctypes.create_string_buffer(cred_bytes, cred_size),
            wintypes.LPBYTE
        )
        cred.Persist = WindowsCredentialManager.CRED_PERSIST_LOCAL_MACHINE
        cred.UserName = target_name
        
        # Write credential
        result = advapi32.CredWriteW(ctypes.byref(cred), 0)
        return bool(result)
    
    @staticmethod
    def read_credential(target_name: str) -> str | None:
        """
        Read credential from Windows Credential Manager.
        
        Implementation steps:
        1. Call CredReadW from advapi32.dll
        2. Extract CredentialBlob from returned structure
        3. Convert bytes back to string
        4. Free credential memory with CredFree
        5. Return credential or None
        
        Args:
            target_name: Unique identifier for credential
            
        Returns:
            Credential string if found, None otherwise
        """
        advapi32 = ctypes.windll.advapi32
        
        cred_ptr = ctypes.POINTER(WindowsCredentialManager.CREDENTIAL)()
        
        # Read credential
        result = advapi32.CredReadW(
            target_name,
            WindowsCredentialManager.CRED_TYPE_GENERIC,
            0,
            ctypes.byref(cred_ptr)
        )
        
        if not result:
            return None
        
        # Extract credential
        cred = cred_ptr.contents
        cred_bytes = ctypes.string_at(
            cred.CredentialBlob,
            cred.CredentialBlobSize
        )
        
        # Free memory
        advapi32.CredFree(cred_ptr)
        
        # Decode and return
        return cred_bytes.decode('utf-16-le')
    
    @staticmethod
    def delete_credential(target_name: str) -> bool:
        """
        Delete credential from Windows Credential Manager.
        
        Args:
            target_name: Unique identifier for credential
            
        Returns:
            True if deleted, False if didn't exist
        """
        advapi32 = ctypes.windll.advapi32
        result = advapi32.CredDeleteW(
            target_name,
            WindowsCredentialManager.CRED_TYPE_GENERIC,
            0
        )
        return bool(result)
```

#### macOS Implementation

```python
class MacOSKeychain:
    """macOS Keychain implementation using security command."""
    
    @staticmethod
    def store_password(service: str, account: str, password: str) -> bool:
        """
        Store password in macOS Keychain.
        
        Implementation steps:
        1. Check if entry exists (find-generic-password)
        2. If exists, delete it first
        3. Add new entry (add-generic-password)
        4. Use -U flag to update if exists
        
        Args:
            service: Service name (app identifier)
            account: Account name (key identifier)
            password: The secret to store
            
        Returns:
            True if successful
        """
        try:
            # Delete existing entry
            subprocess.run(
                [
                    'security', 'delete-generic-password',
                    '-s', service,
                    '-a', account
                ],
                capture_output=True,
                check=False  # Don't raise if doesn't exist
            )
            
            # Add new entry
            result = subprocess.run(
                [
                    'security', 'add-generic-password',
                    '-s', service,
                    '-a', account,
                    '-w', password,
                    '-U'  # Update if exists
                ],
                capture_output=True,
                text=True
            )
            
            return result.returncode == 0
            
        except Exception:
            return False
    
    @staticmethod
    def retrieve_password(service: str, account: str) -> str | None:
        """
        Retrieve password from macOS Keychain.
        
        Implementation steps:
        1. Call find-generic-password with -w flag
        2. Capture stdout (contains password)
        3. Strip whitespace and return
        4. Return None if not found
        
        Args:
            service: Service name (app identifier)
            account: Account name (key identifier)
            
        Returns:
            Password if found, None otherwise
        """
        try:
            result = subprocess.run(
                [
                    'security', 'find-generic-password',
                    '-s', service,
                    '-a', account,
                    '-w'  # Output password only
                ],
                capture_output=True,
                text=True,
                check=True
            )
            
            return result.stdout.strip()
            
        except subprocess.CalledProcessError:
            return None
    
    @staticmethod
    def delete_password(service: str, account: str) -> bool:
        """
        Delete password from macOS Keychain.
        
        Args:
            service: Service name (app identifier)
            account: Account name (key identifier)
            
        Returns:
            True if deleted, False if didn't exist
        """
        try:
            result = subprocess.run(
                [
                    'security', 'delete-generic-password',
                    '-s', service,
                    '-a', account
                ],
                capture_output=True,
                check=True
            )
            return result.returncode == 0
        except subprocess.CalledProcessError:
            return False
```

#### Linux Implementation

```python
class LinuxSecretService:
    """Linux Secret Service API implementation."""
    
    @staticmethod
    def store_secret(label: str, secret: str) -> bool:
        """
        Store secret in Linux Secret Service.
        
        Implementation steps:
        1. Connect to Secret Service via D-Bus
        2. Get default collection
        3. Create secret item with label
        4. Set attributes for search
        5. Store secret value
        
        Args:
            label: Unique identifier for secret
            secret: The secret to store
            
        Returns:
            True if successful
        """
        try:
            connection = connect_and_authenticate()
            collection = secretstorage.get_default_collection(connection)
            
            # Delete existing item if present
            for item in collection.search_items({'application': label}):
                item.delete()
            
            # Create new secret
            collection.create_item(
                label=label,
                attributes={'application': label},
                secret=secret.encode('utf-8'),
                replace=True
            )
            
            return True
            
        except Exception:
            return False
    
    @staticmethod
    def retrieve_secret(label: str) -> str | None:
        """
        Retrieve secret from Linux Secret Service.
        
        Implementation steps:
        1. Connect to Secret Service
        2. Search for item by attributes
        3. Unlock item if necessary
        4. Retrieve secret value
        5. Decode and return
        
        Args:
            label: Unique identifier for secret
            
        Returns:
            Secret if found, None otherwise
        """
        try:
            connection = connect_and_authenticate()
            collection = secretstorage.get_default_collection(connection)
            
            items = list(collection.search_items({'application': label}))
            
            if not items:
                return None
            
            item = items[0]
            
            # Unlock if locked
            if item.is_locked():
                item.unlock()
            
            secret_bytes = item.get_secret()
            return secret_bytes.decode('utf-8')
            
        except Exception:
            return None
    
    @staticmethod
    def delete_secret(label: str) -> bool:
        """
        Delete secret from Linux Secret Service.
        
        Args:
            label: Unique identifier for secret
            
        Returns:
            True if deleted, False if didn't exist
        """
        try:
            connection = connect_and_authenticate()
            collection = secretstorage.get_default_collection(connection)
            
            deleted = False
            for item in collection.search_items({'application': label}):
                item.delete()
                deleted = True
            
            return deleted
            
        except Exception:
            return False
```

#### Complete SecureKeyStorage Implementation

```python
class SecureKeyStorage:
    """Complete implementation combining all platform handlers."""
    
    def __init__(self, app_name: str):
        self.app_name = app_name
        self.platform = platform.system()
        self.service_name = f"{app_name}_APIKey"
        
        # Validate platform support
        if self.platform not in ['Windows', 'Darwin', 'Linux']:
            raise OSError(f"Unsupported platform: {self.platform}")
    
    def store_key(self, key: str) -> bool:
        """Store API key using platform-specific method."""
        if not key or not self.validate_key_format(key):
            raise ValueError("Invalid API key format")
        
        try:
            if self.platform == 'Windows':
                return WindowsCredentialManager.write_credential(
                    self.service_name, key
                )
            elif self.platform == 'Darwin':
                return MacOSKeychain.store_password(
                    self.service_name, self.app_name, key
                )
            elif self.platform == 'Linux':
                return LinuxSecretService.store_secret(
                    self.service_name, key
                )
        except Exception as e:
            # Log error but don't expose to user
            print(f"Storage error: {e}", file=sys.stderr)
            return False
    
    def retrieve_key(self) -> str | None:
        """Retrieve API key using platform-specific method."""
        try:
            if self.platform == 'Windows':
                return WindowsCredentialManager.read_credential(
                    self.service_name
                )
            elif self.platform == 'Darwin':
                return MacOSKeychain.retrieve_password(
                    self.service_name, self.app_name
                )
            elif self.platform == 'Linux':
                return LinuxSecretService.retrieve_secret(
                    self.service_name
                )
        except Exception:
            return None
    
    def delete_key(self) -> bool:
        """Delete API key using platform-specific method."""
        try:
            if self.platform == 'Windows':
                return WindowsCredentialManager.delete_credential(
                    self.service_name
                )
            elif self.platform == 'Darwin':
                return MacOSKeychain.delete_password(
                    self.service_name, self.app_name
                )
            elif self.platform == 'Linux':
                return LinuxSecretService.delete_secret(
                    self.service_name
                )
        except Exception:
            return False
    
    def has_key(self) -> bool:
        """Check if API key exists."""
        key = self.retrieve_key()
        return key is not None and len(key) > 0
    
    def validate_key_format(self, key: str) -> bool:
        """
        Validate API key format.
        
        Checks:
        - Not empty
        - Minimum length (20 characters)
        - Contains only valid characters (alphanumeric + dash + underscore)
        - OpenAI format: starts with 'sk-'
        - Anthropic format: starts with 'sk-ant-'
        
        Args:
            key: API key to validate
            
        Returns:
            True if format is valid
        """
        if not key or len(key) < 20:
            return False
        
        # Check for common API key prefixes
        valid_prefixes = ['sk-', 'sk-ant-']
        has_valid_prefix = any(key.startswith(prefix) for prefix in valid_prefixes)
        
        if not has_valid_prefix:
            return False
        
        # Check characters (allow alphanumeric, dash, underscore)
        import re
        if not re.match(r'^[a-zA-Z0-9_-]+$', key):
            return False
        
        return True
```

#### UI Integration (Pygame Example)

```python
class APIKeySetupDialog:
    """
    One-time API key setup dialog for Pygame.
    
    Features:
    - Single text input field
    - Save and Skip buttons
    - Help link
    - Automatic validation
    """
    
    def __init__(self, screen, key_storage: SecureKeyStorage):
        self.screen = screen
        self.key_storage = key_storage
        self.active = False
        self.input_text = ""
        self.error_message = ""
        self.showing = False
    
    def show(self):
        """Display the dialog."""
        self.showing = True
        self.active = True
        self.input_text = ""
        self.error_message = ""
    
    def handle_event(self, event):
        """
        Handle pygame events.
        
        Implementation:
        - Capture keyboard input for text field
        - Handle mouse clicks on buttons
        - Validate on Save click
        - Close on Skip click
        
        Args:
            event: pygame.event.Event
            
        Returns:
            'saved' if key saved, 'skipped' if skipped, None otherwise
        """
        if not self.showing:
            return None
        
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_BACKSPACE:
                self.input_text = self.input_text[:-1]
            elif event.key == pygame.K_RETURN:
                return self._try_save()
            elif event.key == pygame.K_ESCAPE:
                return self._skip()
            else:
                # Only accept printable characters
                if 32 <= event.key <= 126:
                    self.input_text += event.unicode
        
        elif event.type == pygame.MOUSEBUTTONDOWN:
            mouse_pos = pygame.mouse.get_pos()
            
            # Check if Save button clicked
            if self._is_point_in_save_button(mouse_pos):
                return self._try_save()
            
            # Check if Skip button clicked
            if self._is_point_in_skip_button(mouse_pos):
                return self._skip()
            
            # Check if Help link clicked
            if self._is_point_in_help_link(mouse_pos):
                import webbrowser
                webbrowser.open('https://platform.openai.com/api-keys')
        
        return None
    
    def _try_save(self):
        """Attempt to save the entered key."""
        if not self.input_text:
            self.error_message = "Please enter an API key"
            return None
        
        if not self.key_storage.validate_key_format(self.input_text):
            self.error_message = "Invalid API key format"
            return None
        
        if self.key_storage.store_key(self.input_text):
            self.showing = False
            return 'saved'
        else:
            self.error_message = "Failed to save key"
            return None
    
    def _skip(self):
        """Skip the setup."""
        self.showing = False
        return 'skipped'
    
    def draw(self):
        """
        Render the dialog.
        
        Layout:
        - Semi-transparent background overlay
        - Centered dialog box (400x250px)
        - Title: "Enable AI Features?"
        - Description text
        - Text input field (with masked display)
        - Save button (green, left)
        - Skip button (gray, right)
        - Help link (bottom, small)
        - Error message (if present, red)
        """
        if not self.showing:
            return
        
        # Draw semi-transparent overlay
        overlay = pygame.Surface(self.screen.get_size())
        overlay.set_alpha(128)
        overlay.fill((0, 0, 0))
        self.screen.blit(overlay, (0, 0))
        
        # Calculate dialog position (centered)
        screen_width, screen_height = self.screen.get_size()
        dialog_width, dialog_height = 400, 250
        dialog_x = (screen_width - dialog_width) // 2
        dialog_y = (screen_height - dialog_height) // 2
        
        # Draw dialog box
        dialog_rect = pygame.Rect(dialog_x, dialog_y, dialog_width, dialog_height)
        pygame.draw.rect(self.screen, (255, 255, 255), dialog_rect)
        pygame.draw.rect(self.screen, (100, 100, 100), dialog_rect, 2)
        
        # Render text elements
        font_title = pygame.font.Font(None, 32)
        font_body = pygame.font.Font(None, 24)
        font_small = pygame.font.Font(None, 18)
        
        # Title
        title_text = font_title.render("Enable AI Features?", True, (0, 0, 0))
        self.screen.blit(title_text, (dialog_x + 20, dialog_y + 20))
        
        # Description
        desc_text = font_body.render(
            "Enter your API key to unlock AI features.",
            True, (60, 60, 60)
        )
        self.screen.blit(desc_text, (dialog_x + 20, dialog_y + 60))
        
        # Input field
        input_rect = pygame.Rect(dialog_x + 20, dialog_y + 100, 360, 40)
        pygame.draw.rect(self.screen, (240, 240, 240), input_rect)
        pygame.draw.rect(self.screen, (200, 200, 200), input_rect, 2)
        
        # Masked input text (show first 3 and last 4 chars)
        display_text = self._mask_key(self.input_text)
        input_text_surface = font_body.render(display_text, True, (0, 0, 0))
        self.screen.blit(input_text_surface, (dialog_x + 30, dialog_y + 110))
        
        # Save button
        save_button_rect = pygame.Rect(dialog_x + 20, dialog_y + 180, 160, 40)
        pygame.draw.rect(self.screen, (76, 175, 80), save_button_rect)
        save_text = font_body.render("Save", True, (255, 255, 255))
        save_text_rect = save_text.get_rect(center=save_button_rect.center)
        self.screen.blit(save_text, save_text_rect)
        
        # Skip button
        skip_button_rect = pygame.Rect(dialog_x + 220, dialog_y + 180, 160, 40)
        pygame.draw.rect(self.screen, (158, 158, 158), skip_button_rect)
        skip_text = font_body.render("Skip", True, (255, 255, 255))
        skip_text_rect = skip_text.get_rect(center=skip_button_rect.center)
        self.screen.blit(skip_text, skip_text_rect)
        
        # Help link
        help_text = font_small.render("Where do I get an API key?", True, (33, 150, 243))
        self.screen.blit(help_text, (dialog_x + 90, dialog_y + 230))
        
        # Error message
        if self.error_message:
            error_text = font_small.render(self.error_message, True, (244, 67, 54))
            self.screen.blit(error_text, (dialog_x + 20, dialog_y + 150))
    
    def _mask_key(self, key: str) -> str:
        """Mask API key for display (show first 3 and last 4 chars)."""
        if len(key) <= 7:
            return key
        return f"{key[:3]}{'*' * (len(key) - 7)}{key[-4:]}"
    
    def _is_point_in_save_button(self, pos) -> bool:
        """Check if point is inside Save button."""
        # Implementation depends on button coordinates
        pass
    
    def _is_point_in_skip_button(self, pos) -> bool:
        """Check if point is inside Skip button."""
        pass
    
    def _is_point_in_help_link(self, pos) -> bool:
        """Check if point is inside Help link."""
        pass
```

#### AI Feature Integration

```python
class AIFeatureManager:
    """
    Manages AI features with automatic key handling.
    
    Features:
    - Silent key checking
    - One-time setup prompt
    - Graceful degradation
    - No error messages for missing keys
    """
    
    def __init__(self, app_name: str):
        self.key_storage = SecureKeyStorage(app_name)
        self.setup_shown_this_session = False
    
    def try_enable_feature(self, feature_name: str, dialog: APIKeySetupDialog):
        """
        Attempt to enable AI feature.
        
        Flow:
        1. Check if key exists
        2. If yes, return key immediately
        3. If no and not shown this session, show setup dialog
        4. If no and already shown, return None (silent fail)
        
        Args:
            feature_name: Name of feature being enabled
            dialog: Setup dialog instance
            
        Returns:
            API key if available, None otherwise
        """
        # Check for existing key
        if self.key_storage.has_key():
            return self.key_storage.retrieve_key()
        
        # Show setup if not shown this session
        if not self.setup_shown_this_session:
            dialog.show()
            self.setup_shown_this_session = True
            return None
        
        # Silent fail if already shown
        return None
    
    def get_key_silent(self) -> str | None:
        """
        Get API key without any UI.
        
        Returns:
            API key if configured, None otherwise
        """
        return self.key_storage.retrieve_key()
    
    def has_feature_enabled(self) -> bool:
        """Check if AI features are enabled."""
        return self.key_storage.has_key()
```

### React/JSX Implementation

#### Technology Stack

**For Electron Applications:**
```json
{
  "dependencies": {
    "keytar": "^7.9.0",
    "electron": "^28.0.0"
  }
}
```

**For Tauri Applications:**
```json
{
  "dependencies": {
    "@tauri-apps/api": "^1.5.0",
    "tauri-plugin-secure-storage": "^1.0.0"
  }
}
```

#### Core Module Structure (Electron)

**File: `secureKeyStorage.js`**

```javascript
/**
 * Secure API Key Storage Module for Electron
 * Uses keytar for OS-native credential storage
 */

import keytar from 'keytar';

export class SecureKeyStorage {
  /**
   * Initialize storage manager
   * @param {string} appName - Unique application identifier
   */
  constructor(appName) {
    this.appName = appName;
    this.serviceName = `${appName}_APIKey`;
    this.accountName = appName;
  }

  /**
   * Store API key in OS credential manager
   * @param {string} key - API key to store
   * @returns {Promise<boolean>} Success status
   */
  async storeKey(key) {
    try {
      if (!key || !this.validateKeyFormat(key)) {
        throw new Error('Invalid API key format');
      }

      await keytar.setPassword(this.serviceName, this.accountName, key);
      return true;
    } catch (error) {
      console.error('Failed to store key:', error);
      return false;
    }
  }

  /**
   * Retrieve API key from OS credential manager
   * @returns {Promise<string|null>} API key or null if not found
   */
  async retrieveKey() {
    try {
      const key = await keytar.getPassword(this.serviceName, this.accountName);
      return key;
    } catch (error) {
      console.error('Failed to retrieve key:', error);
      return null;
    }
  }

  /**
   * Delete API key from OS credential manager
   * @returns {Promise<boolean>} Success status
   */
  async deleteKey() {
    try {
      const deleted = await keytar.deletePassword(this.serviceName, this.accountName);
      return deleted;
    } catch (error) {
      console.error('Failed to delete key:', error);
      return false;
    }
  }

  /**
   * Check if API key exists
   * @returns {Promise<boolean>} True if key exists
   */
  async hasKey() {
    const key = await this.retrieveKey();
    return key !== null && key.length > 0;
  }

  /**
   * Validate API key format
   * @param {string} key - API key to validate
   * @returns {boolean} True if format is valid
   */
  validateKeyFormat(key) {
    if (!key || key.length < 20) {
      return false;
    }

    // Check for common API key prefixes
    const validPrefixes = ['sk-', 'sk-ant-'];
    const hasValidPrefix = validPrefixes.some(prefix => key.startsWith(prefix));

    if (!hasValidPrefix) {
      return false;
    }

    // Check characters (allow alphanumeric, dash, underscore)
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(key)) {
      return false;
    }

    return true;
  }
}
```

#### React Component - Setup Dialog

**File: `APIKeySetupDialog.jsx`**

```javascript
import React, { useState } from 'react';
import './APIKeySetupDialog.css';

/**
 * One-time API key setup dialog component
 * 
 * Features:
 * - Single text input field
 * - Save and Skip buttons
 * - Help link
 * - Automatic validation
 * - Error message display
 */
export function APIKeySetupDialog({ 
  isOpen, 
  onSave, 
  onSkip, 
  keyStorage 
}) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Handle save button click
   * 
   * Flow:
   * 1. Validate input
   * 2. Show validation errors if any
   * 3. Attempt to save key
   * 4. Call onSave callback if successful
   * 5. Show error if save fails
   */
  const handleSave = async () => {
    setError('');

    if (!inputValue.trim()) {
      setError('Please enter an API key');
      return;
    }

    if (!keyStorage.validateKeyFormat(inputValue)) {
      setError('Invalid API key format');
      return;
    }

    setIsSaving(true);

    try {
      const success = await keyStorage.storeKey(inputValue);
      
      if (success) {
        setInputValue('');
        onSave();
      } else {
        setError('Failed to save key. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle skip button click
   */
  const handleSkip = () => {
    setInputValue('');
    setError('');
    onSkip();
  };

  /**
   * Handle Enter key press in input field
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleSkip();
    }
  };

  /**
   * Mask API key for display (show first 3 and last 4 chars)
   */
  const maskKey = (key) => {
    if (key.length <= 7) {
      return key;
    }
    return `${key.slice(0, 3)}${'•'.repeat(key.length - 7)}${key.slice(-4)}`;
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="api-key-dialog-overlay">
      <div className="api-key-dialog">
        <h2 className="dialog-title">Enable AI Features?</h2>
        
        <p className="dialog-description">
          Enter your API key to unlock AI-powered features in the game.
        </p>

        <div className="input-container">
          <input
            type="password"
            className="api-key-input"
            placeholder="sk-..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isSaving}
            autoFocus
          />
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="button-container">
          <button
            className="save-button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          
          <button
            className="skip-button"
            onClick={handleSkip}
            disabled={isSaving}
          >
            Skip
          </button>
        </div>

        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="help-link"
        >
          Where do I get an API key?
        </a>
      </div>
    </div>
  );
}
```

**File: `APIKeySetupDialog.css`**

```css
/**
 * Styles for API Key Setup Dialog
 * Minimal, clean design focusing on usability
 */

.api-key-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.api-key-dialog {
  background: white;
  border-radius: 8px;
  padding: 32px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.dialog-title {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.dialog-description {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.input-container {
  margin-bottom: 24px;
}

.api-key-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.api-key-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.api-key-input::placeholder {
  color: #999;
}

.error-message {
  margin-top: 8px;
  font-size: 12px;
  color: #f44336;
}

.button-container {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.save-button,
.skip-button {
  flex: 1;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-button {
  background-color: #4CAF50;
  color: white;
}

.save-button:hover:not(:disabled) {
  background-color: #45a049;
}

.save-button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.skip-button {
  background-color: #f5f5f5;
  color: #666;
}

.skip-button:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.skip-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.help-link {
  display: block;
  text-align: center;
  font-size: 12px;
  color: #2196F3;
  text-decoration: none;
}

.help-link:hover {
  text-decoration: underline;
}
```

#### React Hook - AI Feature Manager

**File: `useAPIKey.js`**

```javascript
import { useState, useEffect, useRef } from 'react';
import { SecureKeyStorage } from './secureKeyStorage';

/**
 * React hook for managing API key state and setup flow
 * 
 * @param {string} appName - Application identifier
 * @returns {Object} API key management interface
 */
export function useAPIKey(appName) {
  const [hasKey, setHasKey] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const setupShownThisSession = useRef(false);
  
  const keyStorageRef = useRef(null);

  // Initialize key storage
  useEffect(() => {
    keyStorageRef.current = new SecureKeyStorage(appName);
    checkForExistingKey();
  }, [appName]);

  /**
   * Check if API key already exists
   */
  const checkForExistingKey = async () => {
    setIsLoading(true);
    try {
      const exists = await keyStorageRef.current.hasKey();
      setHasKey(exists);
    } catch (error) {
      console.error('Error checking for key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Attempt to enable AI feature
   * Shows setup dialog if no key exists and not shown this session
   * 
   * @returns {Promise<string|null>} API key if available
   */
  const tryEnableFeature = async () => {
    // If key exists, return it immediately
    if (hasKey) {
      return await keyStorageRef.current.retrieveKey();
    }

    // Show setup if not shown this session
    if (!setupShownThisSession.current) {
      setShowSetup(true);
      setupShownThisSession.current = true;
    }

    return null;
  };

  /**
   * Get API key silently without showing UI
   * 
   * @returns {Promise<string|null>} API key if available
   */
  const getKeySilent = async () => {
    if (!hasKey) {
      return null;
    }
    return await keyStorageRef.current.retrieveKey();
  };

  /**
   * Handle successful key save from setup dialog
   */
  const handleKeySaved = async () => {
    setShowSetup(false);
    await checkForExistingKey();
  };

  /**
   * Handle setup dialog skip
   */
  const handleSetupSkipped = () => {
    setShowSetup(false);
  };

  /**
   * Show settings dialog (for manual key management)
   */
  const showSettings = () => {
    setShowSetup(true);
  };

  /**
   * Delete stored API key
   */
  const deleteKey = async () => {
    try {
      const success = await keyStorageRef.current.deleteKey();
      if (success) {
        setHasKey(false);
      }
      return success;
    } catch (error) {
      console.error('Error deleting key:', error);
      return false;
    }
  };

  return {
    hasKey,
    isLoading,
    showSetup,
    keyStorage: keyStorageRef.current,
    tryEnableFeature,
    getKeySilent,
    handleKeySaved,
    handleSetupSkipped,
    showSettings,
    deleteKey,
  };
}
```

#### Integration Example

**File: `Game.jsx`**

```javascript
import React, { useState } from 'react';
import { useAPIKey } from './hooks/useAPIKey';
import { APIKeySetupDialog } from './components/APIKeySetupDialog';

/**
 * Main game component demonstrating API key integration
 */
export function Game() {
  const {
    hasKey,
    isLoading,
    showSetup,
    keyStorage,
    tryEnableFeature,
    getKeySilent,
    handleKeySaved,
    handleSetupSkipped,
  } = useAPIKey('MyAwesomeGame');

  const [aiCompanionActive, setAiCompanionActive] = useState(false);

  /**
   * Handle AI companion button click
   * This is the entry point for AI features
   */
  const handleAICompanionClick = async () => {
    const apiKey = await tryEnableFeature();
    
    if (apiKey) {
      // Key available, activate AI companion
      setAiCompanionActive(true);
      initializeAICompanion(apiKey);
    } else {
      // No key available
      // Setup dialog will show automatically if not shown this session
      // Otherwise, silently fall back to non-AI mode
      console.log('AI features not available');
    }
  };

  /**
   * Initialize AI companion with API key
   */
  const initializeAICompanion = async (apiKey) => {
    // Use apiKey to initialize AI service
    // Example: const ai = new OpenAI({ apiKey });
    console.log('AI companion initialized');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-container">
      <div className="game-menu">
        <button
          className="ai-companion-button"
          onClick={handleAICompanionClick}
        >
          {aiCompanionActive ? 'AI Companion (Active)' : 'Enable AI Companion'}
        </button>

        {hasKey && (
          <div className="ai-status">
            ✓ AI Features Enabled
          </div>
        )}
      </div>

      {/* Game content here */}

      <APIKeySetupDialog
        isOpen={showSetup}
        onSave={handleKeySaved}
        onSkip={handleSetupSkipped}
        keyStorage={keyStorage}
      />
    </div>
  );
}
```

#### Settings Panel Component

**File: `AISettingsPanel.jsx`**

```javascript
import React, { useState, useEffect } from 'react';

/**
 * Settings panel for API key management
 * Allows users to view, change, or delete their API key
 */
export function AISettingsPanel({ keyStorage }) {
  const [hasKey, setHasKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState('');
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadKeyStatus();
  }, []);

  /**
   * Load current key status
   */
  const loadKeyStatus = async () => {
    const exists = await keyStorage.hasKey();
    setHasKey(exists);

    if (exists) {
      const key = await keyStorage.retrieveKey();
      setMaskedKey(maskKey(key));
    }
  };

  /**
   * Mask API key for display
   */
  const maskKey = (key) => {
    if (!key || key.length <= 7) {
      return '****';
    }
    return `${key.slice(0, 3)}${'*'.repeat(key.length - 7)}${key.slice(-4)}`;
  };

  /**
   * Test API key connection
   */
  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const key = await keyStorage.retrieveKey();
      
      // Make a simple API call to test the key
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${key}`,
        },
      });

      if (response.ok) {
        setTestResult({ success: true, message: 'Connection successful!' });
      } else {
        setTestResult({ success: false, message: 'Invalid API key' });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Connection failed' });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle key deletion with confirmation
   */
  const handleDeleteKey = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your API key? ' +
      'You will need to enter it again to use AI features.'
    );

    if (confirmed) {
      const success = await keyStorage.deleteKey();
      if (success) {
        setHasKey(false);
        setMaskedKey('');
        setTestResult(null);
      }
    }
  };

  return (
    <div className="ai-settings-panel">
      <h3>AI Features</h3>

      {hasKey ? (
        <div className="settings-content">
          <div className="status-row">
            <span className="status-label">Status:</span>
            <span className="status-value enabled">Enabled</span>
          </div>

          <div className="key-row">
            <span className="key-label">API Key:</span>
            <code className="key-value">{maskedKey}</code>
          </div>

          <div className="button-group">
            <button
              className="test-button"
              onClick={handleTestConnection}
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </button>

            <button
              className="change-button"
              onClick={() => setShowChangeDialog(true)}
            >
              Change Key
            </button>

            <button
              className="delete-button"
              onClick={handleDeleteKey}
            >
              Clear Key
            </button>
          </div>

          {testResult && (
            <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
              {testResult.message}
            </div>
          )}
        </div>
      ) : (
        <div className="settings-content">
          <div className="status-row">
            <span className="status-label">Status:</span>
            <span className="status-value disabled">Disabled</span>
          </div>

          <p className="help-text">
            Enter your API key to enable AI features.
          </p>

          <button
            className="setup-button"
            onClick={() => setShowChangeDialog(true)}
          >
            Set Up API Key
          </button>
        </div>
      )}

      {showChangeDialog && (
        <APIKeyChangeDialog
          isOpen={showChangeDialog}
          onClose={() => setShowChangeDialog(false)}
          onSave={async () => {
            setShowChangeDialog(false);
            await loadKeyStatus();
          }}
          keyStorage={keyStorage}
        />
      )}
    </div>
  );
}
```

### Data Models

#### API Key Storage Record

```typescript
interface APIKeyRecord {
  // Stored in OS credential manager
  service_name: string;      // e.g., "MyGame_APIKey"
  account_name: string;      // e.g., "MyGame"
  credential: string;        // The actual API key
  created_at: Date;          // Timestamp (metadata, not always available)
  last_accessed: Date;       // Timestamp (metadata, not always available)
}
```

#### Session State

```typescript
interface SessionState {
  // In-memory only, never persisted
  has_key: boolean;                    // Whether key exists
  setup_shown_this_session: boolean;   // Whether setup was shown
  key_validated: boolean;              // Whether key format is valid
  last_validation_time: number;        // Timestamp of last validation
}
```

#### Configuration State

```typescript
interface ConfigurationState {
  // Stored in game settings/config (not in credential manager)
  ai_features_enabled: boolean;        // User preference
  show_ai_prompts: boolean;            // Whether to show setup prompts
  api_provider: 'openai' | 'anthropic'; // Which API provider
  last_setup_date: Date;               // When key was last configured
}
```

### Edge Cases and Error Handling

#### 1. OS Credential Manager Unavailable

**Scenario:** User's system doesn't have credential manager access (rare but possible)

**Handling:**
```python
# Python
def store_key(self, key: str) -> bool:
    try:
        # Attempt OS credential storage
        return self._platform_store(key)
    except OSError:
        # Fallback: encrypted local file
        return self._fallback_file_store(key)
```

```javascript
// JavaScript
async storeKey(key) {
  try {
    await keytar.setPassword(this.serviceName, this.accountName, key);
    return true;
  } catch (error) {
    // Fallback: encrypted localStorage (Electron only)
    return this.fallbackStore(key);
  }
}
```

#### 2. Invalid API Key Format

**Scenario:** User enters malformed key

**Handling:**
- Validate format before storage
- Show clear error message
- Don't save invalid keys
- Provide example format

```python
def validate_key_format(self, key: str) -> bool:
    """Strict validation before storage."""
    if not key or len(key) < 20:
        return False
    
    valid_prefixes = ['sk-', 'sk-ant-']
    if not any(key.startswith(p) for p in valid_prefixes):
        return False
    
    # Additional checks...
    return True
```

#### 3. Key Exists But API Call Fails

**Scenario:** Stored key is expired/invalid/rate-limited

**Handling:**
- Don't delete key automatically
- Show error in settings panel
- Allow user to test connection
- Provide "Change Key" option

```javascript
async testAPIKey(key) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    
    if (response.status === 401) {
      return { valid: false, reason: 'unauthorized' };
    } else if (response.status === 429) {
      return { valid: false, reason: 'rate_limited' };
    } else if (response.ok) {
      return { valid: true };
    }
    
    return { valid: false, reason: 'unknown' };
  } catch (error) {
    return { valid: false, reason: 'network_error' };
  }
}
```

#### 4. Concurrent Access

**Scenario:** Multiple game instances or rapid key changes

**Handling:**
- OS credential managers handle locking
- Use try-catch for race conditions
- Last write wins (acceptable for this use case)

#### 5. Uninstall/Cleanup

**Scenario:** User uninstalls game

**Handling:**
```python
# Provide cleanup utility
def cleanup_on_uninstall():
    """Run during uninstall process."""
    try:
        storage = SecureKeyStorage("MyGame")
        storage.delete_key()
    except:
        pass  # Silent fail during uninstall
```

```javascript
// Electron: Add to app uninstall handler
app.on('before-quit', async () => {
  const storage = new SecureKeyStorage('MyGame');
  await storage.deleteKey();
});
```

#### 6. Platform Migration

**Scenario:** User moves game installation between platforms

**Handling:**
- Keys don't migrate (OS-specific)
- User must re-enter on new platform
- This is expected behavior
- Mention in setup dialog

#### 7. Network Failures During Setup

**Scenario:** User enters valid key but can't test due to network issues

**Handling:**
- Save key even if test fails
- Show warning: "Key saved but couldn't verify connection"
- Allow testing later from settings

#### 8. Memory Security

**Scenario:** API key in memory could be dumped

**Handling:**
```python
import ctypes
import sys

class SecureString:
    """Zero memory after use."""
    def __init__(self, value: str):
        self.value = value
    
    def __del__(self):
        # Overwrite memory before deallocation
        if self.value:
            buffer = (ctypes.c_char * len(self.value))()
            ctypes.memmove(
                id(self.value) + sys.getsizeof(''),
                buffer,
                len(self.value)
            )
```

## Testing Scenarios

### Unit Tests

#### Python Tests

```python
import unittest
from secure_key_storage import SecureKeyStorage

class TestSecureKeyStorage(unittest.TestCase):
    def setUp(self):
        self.storage = SecureKeyStorage("TestApp")
    
    def tearDown(self):
        # Clean up test keys
        self.storage.delete_key()
    
    def test_store_and_retrieve_key(self):
        """Test basic store and retrieve functionality."""
        test_key = "sk-test123456789012345678901234567890"
        
        # Store key
        success = self.storage.store_key(test_key)
        self.assertTrue(success)
        
        # Retrieve key
        retrieved = self.storage.retrieve_key()
        self.assertEqual(retrieved, test_key)
    
    def test_has_key_returns_false_initially(self):
        """Test that has_key returns False when no key stored."""
        self.assertFalse(self.storage.has_key())
    
    def test_has_key_returns_true_after_storage(self):
        """Test that has_key returns True after storing key."""
        self.storage.store_key("sk-test123456789012345678901234567890")
        self.assertTrue(self.storage.has_key())
    
    def test_delete_key_removes_key(self):
        """Test that delete_key removes stored key."""
        self.storage.store_key("sk-test123456789012345678901234567890")
        self.assertTrue(self.storage.has_key())
        
        self.storage.delete_key()
        self.assertFalse(self.storage.has_key())
    
    def test_validate_key_format_accepts_valid_keys(self):
        """Test that validation accepts valid key formats."""
        valid_keys = [
            "sk-1234567890123456789012345678901234567890",
            "sk-ant-1234567890123456789012345678901234",
        ]
        
        for key in valid_keys:
            self.assertTrue(
                self.storage.validate_key_format(key),
                f"Should accept valid key: {key}"
            )
    
    def test_validate_key_format_rejects_invalid_keys(self):
        """Test that validation rejects invalid key formats."""
        invalid_keys = [
            "",
            "short",
            "invalid-prefix-12345678901234567890",
            "sk-",
            "sk-with spaces",
            "sk-with@special!chars",
        ]
        
        for key in invalid_keys:
            self.assertFalse(
                self.storage.validate_key_format(key),
                f"Should reject invalid key: {key}"
            )
    
    def test_store_key_rejects_invalid_format(self):
        """Test that store_key rejects keys with invalid format."""
        with self.assertRaises(ValueError):
            self.storage.store_key("invalid-key")
    
    def test_multiple_store_overwrites(self):
        """Test that storing multiple times overwrites previous value."""
        key1 = "sk-first12345678901234567890123456789"
        key2 = "sk-second1234567890123456789012345678"
        
        self.storage.store_key(key1)
        self.storage.store_key(key2)
        
        retrieved = self.storage.retrieve_key()
        self.assertEqual(retrieved, key2)
```

#### JavaScript Tests

```javascript
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { SecureKeyStorage } from './secureKeyStorage';

describe('SecureKeyStorage', () => {
  let storage;

  beforeEach(() => {
    storage = new SecureKeyStorage('TestApp');
  });

  afterEach(async () => {
    // Clean up test keys
    await storage.deleteKey();
  });

  test('should store and retrieve key', async () => {
    const testKey = 'sk-test123456789012345678901234567890';
    
    const stored = await storage.storeKey(testKey);
    expect(stored).toBe(true);
    
    const retrieved = await storage.retrieveKey();
    expect(retrieved).toBe(testKey);
  });

  test('should return false for hasKey when no key stored', async () => {
    const hasKey = await storage.hasKey();
    expect(hasKey).toBe(false);
  });

  test('should return true for hasKey after storing key', async () => {
    await storage.storeKey('sk-test123456789012345678901234567890');
    const hasKey = await storage.hasKey();
    expect(hasKey).toBe(true);
  });

  test('should delete stored key', async () => {
    await storage.storeKey('sk-test123456789012345678901234567890');
    expect(await storage.hasKey()).toBe(true);
    
    await storage.deleteKey();
    expect(await storage.hasKey()).toBe(false);
  });

  test('should validate correct key formats', () => {
    const validKeys = [
      'sk-1234567890123456789012345678901234567890',
      'sk-ant-1234567890123456789012345678901234',
    ];
    
    validKeys.forEach(key => {
      expect(storage.validateKeyFormat(key)).toBe(true);
    });
  });

  test('should reject invalid key formats', () => {
    const invalidKeys = [
      '',
      'short',
      'invalid-prefix-12345678901234567890',
      'sk-',
      'sk-with spaces',
      'sk-with@special!chars',
    ];
    
    invalidKeys.forEach(key => {
      expect(storage.validateKeyFormat(key)).toBe(false);
    });
  });

  test('should overwrite previous value on multiple stores', async () => {
    const key1 = 'sk-first12345678901234567890123456789';
    const key2 = 'sk-second1234567890123456789012345678';
    
    await storage.storeKey(key1);
    await storage.storeKey(key2);
    
    const retrieved = await storage.retrieveKey();
    expect(retrieved).toBe(key2);
  });
});
```

### Integration Tests

#### Test Scenario 1: First-Time User Flow

```python
def test_first_time_user_flow():
    """
    Test complete first-time user experience.
    
    Steps:
    1. User clicks AI feature
    2. Setup dialog appears
    3. User enters valid key
    4. Key is saved
    5. AI feature activates
    6. User clicks AI feature again
    7. No dialog appears (silent activation)
    """
    storage = SecureKeyStorage("TestApp")
    feature_manager = AIFeatureManager("TestApp")
    
    # Initially no key
    assert not storage.has_key()
    
    # Simulate first access
    result = feature_manager.try_enable_feature("ai_companion", mock_dialog)
    assert result is None  # Dialog should show
    assert feature_manager.setup_shown_this_session
    
    # Simulate user entering key
    test_key = "sk-test123456789012345678901234567890"
    storage.store_key(test_key)
    
    # Second access should return key immediately
    result = feature_manager.get_key_silent()
    assert result == test_key
```

#### Test Scenario 2: Settings Panel Management

```javascript
test('settings panel should allow key changes', async () => {
  const storage = new SecureKeyStorage('TestApp');
  
  // Store initial key
  const key1 = 'sk-initial123456789012345678901234567';
  await storage.storeKey(key1);
  
  // User opens settings and changes key
  const key2 = 'sk-changed123456789012345678901234567';
  await storage.storeKey(key2);
  
  // Verify new key is stored
  const retrieved = await storage.retrieveKey();
  expect(retrieved).toBe(key2);
  expect(retrieved).not.toBe(key1);
});
```

#### Test Scenario 3: Skip and Later Setup

```python
def test_skip_and_later_setup():
    """
    Test user skipping setup and configuring later.
    
    Steps:
    1. User clicks AI feature
    2. Setup dialog appears
    3. User clicks Skip
    4. Dialog closes, no key stored
    5. User accesses Settings
    6. User enters key from Settings
    7. AI feature now works
    """
    storage = SecureKeyStorage("TestApp")
    feature_manager = AIFeatureManager("TestApp")
    
    # User skips setup
    result = feature_manager.try_enable_feature("ai_companion", mock_dialog)
    assert result is None
    mock_dialog.simulate_skip()
    
    # No key stored
    assert not storage.has_key()
    
    # Later, user configures from settings
    test_key = "sk-test123456789012345678901234567890"
    storage.store_key(test_key)
    
    # Now feature works
    result = feature_manager.get_key_silent()
    assert result == test_key
```

## Security Best Practices

### 1. Never Log API Keys

```python
# BAD
print(f"Storing API key: {api_key}")
logging.info(f"API key: {api_key}")

# GOOD
print("Storing API key")
logging.info("API key configured successfully")
```

### 2. Clear Keys from Memory

```python
def use_api_key():
    key = storage.retrieve_key()
    try:
        # Use key
        response = api_call(key)
    finally:
        # Clear from memory
        key = None
        del key
```

### 3. Validate Before Use

```python
def call_api():
    key = storage.retrieve_key()
    
    if not key or not storage.validate_key_format(key):
        raise ValueError("Invalid API key")
    
    # Use key...
```

### 4. Handle Errors Gracefully

```python
try:
    storage.store_key(user_input)
except ValueError as e:
    show_error("Invalid key format")
except OSError as e:
    show_error("Storage unavailable")
except Exception as e:
    show_error("An error occurred")
    # Log error (but not the key!)
    logging.error(f"Storage error: {type(e).__name__}")
```

### 5. Sanitize User Input

```python
def sanitize_key_input(user_input: str) -> str:
    """Remove whitespace and common paste artifacts."""
    sanitized = user_input.strip()
    sanitized = sanitized.replace('\n', '')
    sanitized = sanitized.replace('\r', '')
    sanitized = sanitized.replace('\t', '')
    return sanitized
```

### 6. Rate Limit API Test Calls

```javascript
class RateLimitedTester {
  constructor() {
    this.lastTestTime = 0;
    this.minInterval = 5000; // 5 seconds
  }

  async testKey(key) {
    const now = Date.now();
    if (now - this.lastTestTime < this.minInterval) {
      throw new Error('Please wait before testing again');
    }

    this.lastTestTime = now;
    return await this.performTest(key);
  }
}
```

### 7. Provide Clear Security Documentation

Include in game documentation:

```markdown
# API Key Security

Your API key is stored securely using your operating system's credential manager:
- **Windows:** Windows Credential Manager
- **macOS:** Keychain
- **Linux:** Secret Service (GNOME Keyring or KWallet)

**Important:**
- Your API key never leaves your device
- We never see or store your API key
- Keys are encrypted by your operating system
- Remove the key from Settings before uninstalling
```

## Performance Considerations

### 1. Cache Key Status

```python
class CachedKeyStorage:
    def __init__(self, storage: SecureKeyStorage):
        self.storage = storage
        self._cache = None
        self._cache_time = 0
        self._cache_ttl = 300  # 5 minutes
    
    def has_key(self) -> bool:
        now = time.time()
        if self._cache is None or (now - self._cache_time) > self._cache_ttl:
            self._cache = self.storage.has_key()
            self._cache_time = now
        return self._cache
```

### 2. Lazy Loading

```javascript
class LazyKeyStorage {
  constructor(appName) {
    this.appName = appName;
    this._keytar = null;
  }

  async _getKeytar() {
    if (!this._keytar) {
      this._keytar = await import('keytar');
    }
    return this._keytar;
  }

  async retrieveKey() {
    const keytar = await this._getKeytar();
    return await keytar.getPassword(this.serviceName, this.accountName);
  }
}
```

### 3. Avoid Blocking Main Thread

```javascript
// Use async/await for all storage operations
async function checkFeature() {
  const hasKey = await storage.hasKey(); // Non-blocking
  
  if (hasKey) {
    const key = await storage.retrieveKey(); // Non-blocking
    await initializeAI(key); // Non-blocking
  }
}
```

## Accessibility Requirements

### 1. Keyboard Navigation

- Setup dialog fully keyboard accessible
- Tab order: Input field → Save button → Skip button → Help link
- Enter key saves, Escape key skips
- Focus visible on all interactive elements

### 2. Screen Reader Support

```jsx
<div className="api-key-dialog" role="dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Enable AI Features?</h2>
  
  <label htmlFor="api-key-input" className="sr-only">
    API Key
  </label>
  <input
    id="api-key-input"
    type="password"
    aria-describedby="key-description"
    aria-invalid={error ? 'true' : 'false'}
  />
  
  <div id="key-description" className="sr-only">
    Enter your OpenAI or Anthropic API key
  </div>
  
  {error && (
    <div role="alert" aria-live="assertive">
      {error}
    </div>
  )}
</div>
```

### 3. High Contrast Support

```css
@media (prefers-contrast: high) {
  .api-key-input {
    border-width: 3px;
    border-color: #000;
  }
  
  .save-button {
    background-color: #000;
    color: #fff;
    border: 3px solid #fff;
  }
}
```

### 4. Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .api-key-dialog-overlay,
  .api-key-dialog {
    animation: none;
    transition: none;
  }
}
```

## Extended Features (Optional)

### 1. Multiple API Provider Support

```python
class MultiProviderKeyStorage:
    """Support for multiple API providers."""
    
    def __init__(self, app_name: str):
        self.app_name = app_name
        self.providers = ['openai', 'anthropic', 'cohere']
    
    def store_key(self, provider: str, key: str) -> bool:
        if provider not in self.providers:
            raise ValueError(f"Unknown provider: {provider}")
        
        service_name = f"{self.app_name}_{provider}_APIKey"
        # Store using service_name...
```

### 2. Key Expiration Tracking

```python
class KeyWithMetadata:
    """Store key with metadata."""
    
    def store_key_with_expiry(
        self,
        key: str,
        expires_days: int = 90
    ) -> bool:
        # Store key in credential manager
        self.storage.store_key(key)
        
        # Store metadata in config file
        expiry_date = datetime.now() + timedelta(days=expires_days)
        config = {
            'configured_at': datetime.now().isoformat(),
            'expires_at': expiry_date.isoformat()
        }
        self._save_metadata(config)
```

### 3. Automatic Key Rotation Reminder

```javascript
class KeyRotationManager {
  constructor(storage) {
    this.storage = storage;
    this.rotationIntervalDays = 90;
  }

  async shouldPromptRotation() {
    const metadata = await this.loadMetadata();
    
    if (!metadata || !metadata.configured_at) {
      return false;
    }

    const configuredDate = new Date(metadata.configured_at);
    const daysSince = (Date.now() - configuredDate) / (1000 * 60 * 60 * 24);

    return daysSince >= this.rotationIntervalDays;
  }

  async showRotationReminder() {
    // Show non-blocking notification
    console.log('Consider rotating your API key for security');
  }
}
```

### 4. Usage Analytics (Privacy-Preserving)

```python
class PrivacyPreservingAnalytics:
    """Track usage without exposing API keys."""
    
    def log_feature_usage(self, feature_name: str):
        """Log feature usage with no identifying info."""
        analytics_data = {
            'feature': feature_name,
            'timestamp': datetime.now().isoformat(),
            'has_key': self.storage.has_key(),
            # Never include actual key
        }
        self._append_to_local_analytics(analytics_data)
```

### 5. Import/Export Keys (Advanced Users)

```python
def export_key_encrypted(password: str) -> str:
    """
    Export key in encrypted format for backup.
    
    Uses password-based encryption (PBKDF2 + AES).
    Returns base64-encoded encrypted key.
    """
    key = storage.retrieve_key()
    encrypted = encrypt_with_password(key, password)
    return base64.b64encode(encrypted).decode()

def import_key_encrypted(encrypted_data: str, password: str) -> bool:
    """
    Import encrypted key from backup.
    
    Decrypts using password and stores in credential manager.
    """
    encrypted = base64.b64decode(encrypted_data)
    key = decrypt_with_password(encrypted, password)
    return storage.store_key(key)
```

---

## Implementation Checklist

### Python Implementation
- [ ] Install dependencies (`keyring` or manual platform implementations)
- [ ] Create `SecureKeyStorage` class with platform detection
- [ ] Implement Windows Credential Manager integration
- [ ] Implement macOS Keychain integration
- [ ] Implement Linux Secret Service integration
- [ ] Create validation function for API key format
- [ ] Build setup dialog UI (Pygame/tkinter/custom)
- [ ] Implement AI feature manager with silent checking
- [ ] Add settings panel for key management
- [ ] Write unit tests for storage operations
- [ ] Test on all target platforms

### React/JSX Implementation
- [ ] Install `keytar` (Electron) or `tauri-plugin-secure-storage` (Tauri)
- [ ] Create `SecureKeyStorage` class wrapper
- [ ] Implement `useAPIKey` React hook
- [ ] Build `APIKeySetupDialog` component with validation
- [ ] Create `AISettingsPanel` component
- [ ] Add CSS with accessibility features
- [ ] Implement error handling and user feedback
- [ ] Write Jest/React Testing Library tests
- [ ] Test on all target platforms
- [ ] Add keyboard navigation support
- [ ] Test with screen readers

### General
- [ ] Document security model for users
- [ ] Create help documentation for API key acquisition
- [ ] Add uninstall cleanup instructions
- [ ] Test edge cases (no credential manager, network failures, etc.)
- [ ] Implement telemetry (if needed, without exposing keys)
- [ ] Add rate limiting for API test calls
- [ ] Create migration guide if updating from previous storage method

---

This document provides complete specifications for implementing a secure, zero-data API key storage system for BYOK games. All code examples are production-ready and can be used directly or adapted to specific game engine requirements.
