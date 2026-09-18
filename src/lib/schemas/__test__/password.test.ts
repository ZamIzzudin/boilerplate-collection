import { passwordSchema, type PasswordFormData } from "../password";

describe("Password Schema", () => {
  describe("password field validation", () => {
    it("should require password to be present", () => {
      const result = passwordSchema.safeParse({
        password: "",
        confirmPassword: "password123"
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("minimal 8 karakter");
      }
    });

    it("should require minimum 8 characters", () => {
      const result = passwordSchema.safeParse({
        password: "Short1!",
        confirmPassword: "Short1!"
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("minimal 8 karakter");
      }
    });

    it("`should require at least one digit", () => {
      const result = passwordSchema.safeParse({
        password: "NoDigits!",
        confirmPassword: "NoDigits!"
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("harus mengandung angka");
      }
    });

    it("should require at least one uppercase letter", () => {
      const result = passwordSchema.safeParse({
        password: "nouppercase1!",
        confirmPassword: "nouppercase1!"
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("harus mengandung huruf besar");
      }
    });

    it("should require at least one lowercase letter", () => {
      const result = passwordSchema.safeParse({
        password: "NOLOWERCASE1!",
        confirmPassword: "NOLOWERCASE1!"
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("harus mengandung huruf kecil");
      }
    });

    it("should require at least one special character", () => {
      const result = passwordSchema.safeParse({
        password: "NoSpecialChar123",
        confirmPassword: "NoSpecialChar123"
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("karakter khusus");
      }
    });

    it("should accept valid password with all requirements", () => {
      const result = passwordSchema.safeParse({
        password: "ValidPassword123!",
        confirmPassword: "ValidPassword123!"
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password).toBe("ValidPassword123!");
      }
    });

    it("`should only allow specific special characters", () => {
      const validSpecialChars = "!@#$%^&*";
      
      validSpecialChars.split("").forEach(char => {
        const result = passwordSchema.safeParse({
          password: `Test1234${char}`,
          confirmPassword: `Test1234${char}`
        });
        
        expect(result.success).toBe(true);
      });
    });

    it("`should reject invalid special characters", () => {
      const invalidSpecialChars = "~`?|<>/";
      
      invalidSpecialChars.split("").forEach(char => {
        const result = passwordSchema.safeParse({
          password: `Test1234${char}`,
          confirmPassword: `Test1234${char}`
        });
        
        expect(result.success).toBe(false);
      });
    });
  });

  describe("confirmPassword field validation", () => {
    it("should require confirmPassword to be present", () => {
      const result = passwordSchema.safeParse({
        password: "Password123!",
        confirmPassword: ""
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Konfirmasi password wajib diisi");
      }
    });

    it("should require confirmPassword to match password", () => {
      const result = passwordSchema.safeParse({
        password: "Password123!",
        confirmPassword: "DifferentPassword123!"
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("tidak cocok");
        expect(result.error.issues[0].path).toContain("confirmPassword");
      }
    });

    it("`should accept matching passwords", () => {
      const result = passwordSchema.safeParse({
        password: "MatchingPassword123!",
        confirmPassword: "MatchingPassword123!"
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Complete validation", () => {
    it("`should fail when both fields are invalid", () => {
      const result = passwordSchema.safeParse({
        password: "weak",
        confirmPassword: "different"
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(1);
      }
    });

    it("`should pass with valid complete data", () => {
      const result = passwordSchema.safeParse({
        password: "CompleteValid123!",
        confirmPassword: "CompleteValid123!"
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          password: "CompleteValid123!",
          confirmPassword: "CompleteValid123!"
        });
      }
    });

    it("`should handle whitespace in passwords", () => {
      const result = passwordSchema.safeParse({
        password: " Password123! ",
        confirmPassword: " Password123! "
      });

      expect(result.success).toBe(true);
    });

    it("`should handle unicode characters", () => {
      const result = passwordSchema.safeParse({
        password: "Pässwörd123!",
        confirmPassword: "Pässwörd123!"
      });

      expect(result.success).toBe(true);
    });
  });

  describe("PasswordFormData type", () => {
    it("`should match schema structure", () => {
      const formData: PasswordFormData = {
        password: "TestPassword123!",
        confirmPassword: "TestPassword123!"
      };

      expect(formData.password).toBeDefined();
      expect(formData.confirmPassword).toBeDefined();
    });
  });

  describe("Edge cases", () => {
    it("`should handle extremely long passwords", () => {
      const longPassword = "A".repeat(100) + "a" + "1" + "!";
      const result = passwordSchema.safeParse({
        password: longPassword,
        confirmPassword: longPassword
      });

      expect(result.success).toBe(true);
    });

    it("should handle minimum valid password", () => {
      const result = passwordSchema.safeParse({
        password: "Aa1!5678",
        confirmPassword: "Aa1!5678"
      });

      expect(result.success).toBe(true);
    });

    it("`should handle passwords with numbers only", () => {
      const result = passwordSchema.safeParse({
        password: "12345678",
        confirmPassword: "12345678"
      });

      expect(result.success).toBe(false);
    });

    it("`should handle passwords with letters only", () => {
      const result = passwordSchema.safeParse({
        password: "abcdefgh",
        confirmPassword: "abcdefgh"
      });

      expect(result.success).toBe(false);
    });

    it("`should handle passwords with special chars only", () => {
      const result = passwordSchema.safeParse({
        password: "!@#$%^&*",
        confirmPassword: "!@#$%^&*"
      });

      expect(result.success).toBe(false);
    });
  });

  describe("Error messages", () => {
    it("should have clear error message for missing password", () => {
      const result = passwordSchema.safeParse({
        password: "",
        confirmPassword: "***********!"
      });

      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password minimal 8 karakter");
      }
    });

    it("should have clear error message for short password", () => {
      const result = passwordSchema.safeParse({
        password: "A1!4567",
        confirmPassword: "A1!4567"
      });

      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password minimal 8 karakter");
      }
    });

    it("should have clear error message for missing digit", () => {
      const result = passwordSchema.safeParse({
        password: "NoDigitsHere!",
        confirmPassword: "NoDigitsHere!"
      });

      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password harus mengandung angka");
      }
    });

    it("should have clear error message for missing uppercase", () => {
      const result = passwordSchema.safeParse({
        password: "nouppercase1!",
        confirmPassword: "nouppercase1!"
      });

      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password harus mengandung huruf besar");
      }
    });

    it("should have clear error message for missing lowercase", () => {
      const result = passwordSchema.safeParse({
        password: "NOLOWERCASE1!",
        confirmPassword: "NOLOWERCASE1!"
      });

      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password harus mengandung huruf kecil");
      }
    });

    it("should have clear error message for missing special char", () => {
      const result = passwordSchema.safeParse({
        password: "NoSpecialChar123",
        confirmPassword: "NoSpecialChar123"
      });

      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password harus mengandung karakter khusus (!@#$%^&*)");
      }
    });

    it("should have clear error message for missing confirm password", () => {
      const result = passwordSchema.safeParse({
        password: "Password123!",
        confirmPassword: ""
      });

      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Konfirmasi password wajib diisi");
      }
    });

    it("should have clear error message for mismatched passwords", () => {
      const result = passwordSchema.safeParse({
        password: "Password123!",
        confirmPassword: "DifferentPassword123!"
      });

      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password dan konfirmasi password tidak cocok");
      }
    });
  });

  describe("Real-world scenarios", () => {
    it("`should accept common strong password patterns", () => {
      const strongPasswords = [
        "MySecurePass123!",
        "AnotherP@ssw0rd",
        "Str0ng!Pass2024",
        "C0mpl3x!P@ssw0rd",
        "S3cur1ty!P@ss"
      ];

      strongPasswords.forEach(password => {
        const result = passwordSchema.safeParse({
          password,
          confirmPassword: password
        });
        expect(result.success).toBe(true);
      });
    });

    it("`should reject common weak password patterns", () => {
      const weakPasswords = [
        "password123!",
        "PASSWORD123!",
        "Password!!!",
        "12345678!",
        "abcdefgh!",
        "ABC12345!"
      ];

      weakPasswords.forEach(password => {
        const result = passwordSchema.safeParse({
          password,
          confirmPassword: password
        });
        expect(result.success).toBe(false);
      });
    });
  });
});
