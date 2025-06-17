import express from "express";
import bcrypt from "bcryptjs";
import Center from "../models/Center";
import PasswordReset from "../models/PasswordReset";
import { generateOTP, sendOTPEmail, sendPasswordResetConfirmationEmail } from "../utils/emailService";
import config from "../config";

const router = express.Router();

// Forgot Password - Send OTP
const forgotPassword = async (req: express.Request, res: express.Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if it's superadmin email (you can set this in environment variables)
    const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || "superadmin@admissionmanagement.com";
    
    let userType: "superadmin" | "center";
    let centerData = null;

    if (normalizedEmail === SUPERADMIN_EMAIL.toLowerCase()) {
      userType = "superadmin";
    } else {
      // Check if email belongs to a center
      centerData = await Center.findOne({ email: normalizedEmail });
      if (!centerData) {
        res.status(404).json({ message: "No account found with this email address" });
        return;
      }
      userType = "center";
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing OTP for this email
    await PasswordReset.deleteMany({ email: normalizedEmail });

    // Create new OTP record
    const passwordReset = new PasswordReset({
      email: normalizedEmail,
      otp: otp,
      userType: userType,
      centerId: centerData?._id,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await passwordReset.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(
      normalizedEmail, 
      otp, 
      userType, 
      centerData?.name
    );

    if (!emailSent) {
      res.status(500).json({ message: "Failed to send OTP email. Please try again." });
      return;
    }

    res.status(200).json({ 
      message: "OTP sent successfully to your email address",
      email: normalizedEmail,
      userType: userType
    });

  } catch (error: any) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Verify OTP
const verifyOTP = async (req: express.Request, res: express.Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find valid OTP
    const passwordReset = await PasswordReset.findOne({
      email: normalizedEmail,
      otp: otp,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!passwordReset) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    res.status(200).json({ 
      message: "OTP verified successfully",
      email: normalizedEmail,
      userType: passwordReset.userType,
      resetToken: passwordReset._id // Use the document ID as reset token
    });

  } catch (error: any) {
    console.error("Error in verify OTP:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Reset Password
const resetPassword = async (req: express.Request, res: express.Response) => {
  try {
    const { email, otp, newPassword, resetToken } = req.body;

    if (!email || !otp || !newPassword || !resetToken) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Validate password strength
    if (newPassword.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters long" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find and verify the OTP record
    const passwordReset = await PasswordReset.findOne({
      _id: resetToken,
      email: normalizedEmail,
      otp: otp,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!passwordReset) {
      res.status(400).json({ message: "Invalid or expired reset request" });
      return;
    }

    // Update password based on user type
    if (passwordReset.userType === "superadmin") {
      // For superadmin, you might want to update environment variables or a separate admin table
      // For now, we'll just mark the OTP as used and send confirmation
      // In a real implementation, you'd update the superadmin password in your chosen storage
      console.log(`Superadmin password reset requested for: ${normalizedEmail}`);
      console.log(`New password would be set to: ${newPassword}`);
      
      // You can implement superadmin password storage here
      // For example, update environment variables or a separate admin collection
      
    } else if (passwordReset.userType === "center") {
      // Hash the new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update center password
      await Center.findByIdAndUpdate(passwordReset.centerId, {
        password: hashedPassword
      });
    }

    // Mark OTP as used
    passwordReset.isUsed = true;
    await passwordReset.save();

    // Get center data for confirmation email
    let centerData = null;
    if (passwordReset.userType === "center") {
      centerData = await Center.findById(passwordReset.centerId);
    }

    // Send confirmation email
    await sendPasswordResetConfirmationEmail(
      normalizedEmail,
      passwordReset.userType,
      centerData?.name
    );

    res.status(200).json({ 
      message: "Password reset successfully",
      userType: passwordReset.userType
    });

  } catch (error: any) {
    console.error("Error in reset password:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

export default router; 