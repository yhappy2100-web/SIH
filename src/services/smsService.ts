// SMS service for sending notifications and updates
// This service handles SMS functionality for user notifications

interface SMSMessage {
  to: string
  message: string
  type: 'lesson_reminder' | 'achievement' | 'progress_update' | 'custom'
}

interface SMSResponse {
  success: boolean
  messageId?: string
  error?: string
}

class SMSService {
  private apiKey: string
  private apiUrl: string
  private isEnabled: boolean

  constructor() {
    // Initialize with environment variables or default values
    this.apiKey = process.env.VITE_SMS_API_KEY || ''
    this.apiUrl = process.env.VITE_SMS_API_URL || 'https://api.sms-service.com'
    this.isEnabled = !!this.apiKey
  }

  // Send SMS message
  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    if (!this.isEnabled) {
      console.warn('SMS service is not enabled. Please configure API key.')
      return {
        success: false,
        error: 'SMS service not configured'
      }
    }

    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(message.to)) {
        return {
          success: false,
          error: 'Invalid phone number format'
        }
      }

      // Validate message length
      if (message.message.length > 160) {
        return {
          success: false,
          error: 'Message too long (max 160 characters)'
        }
      }

      // Simulate API call - replace with actual SMS API integration
      const response = await this.simulateSMSAPI(message)
      
      return response
    } catch (error) {
      console.error('SMS sending failed:', error)
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      }
    }
  }

  // Send lesson reminder
  async sendLessonReminder(phoneNumber: string, lessonTitle: string, scheduledTime: string): Promise<SMSResponse> {
    const message = `📚 NabhaLearn Reminder: Your lesson "${lessonTitle}" is scheduled for ${scheduledTime}. Don't forget to study!`
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      type: 'lesson_reminder'
    })
  }

  // Send achievement notification
  async sendAchievementNotification(phoneNumber: string, achievementName: string): Promise<SMSResponse> {
    const message = `🏆 Congratulations! You've earned the "${achievementName}" achievement on NabhaLearn. Keep up the great work!`
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      type: 'achievement'
    })
  }

  // Send progress update
  async sendProgressUpdate(phoneNumber: string, progressData: any): Promise<SMSResponse> {
    const message = `📊 Your learning progress: ${progressData.lessonsCompleted} lessons completed, ${progressData.hoursStudied} hours studied. Great job!`
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      type: 'progress_update'
    })
  }

  // Send custom message
  async sendCustomMessage(phoneNumber: string, customMessage: string): Promise<SMSResponse> {
    return this.sendSMS({
      to: phoneNumber,
      message: customMessage,
      type: 'custom'
    })
  }

  // Validate phone number format
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation (international format)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''))
  }

  // Simulate SMS API call - replace with actual implementation
  private async simulateSMSAPI(message: SMSMessage): Promise<SMSResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 95% success rate
        if (Math.random() > 0.05) {
          resolve({
            success: true,
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          })
        } else {
          resolve({
            success: false,
            error: 'Simulated API error'
          })
        }
      }, 2000)
    })
  }

  // Get service status
  getServiceStatus() {
    return {
      enabled: this.isEnabled,
      hasApiKey: !!this.apiKey,
      apiUrl: this.apiUrl
    }
  }

  // Enable/disable service
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled && !!this.apiKey
  }

  // Update API configuration
  updateConfig(apiKey: string, apiUrl?: string) {
    this.apiKey = apiKey
    this.apiUrl = apiUrl || this.apiUrl
    this.isEnabled = !!this.apiKey
  }
}

// Export singleton instance
export const smsService = new SMSService()

// Export types
export type { SMSMessage, SMSResponse }
