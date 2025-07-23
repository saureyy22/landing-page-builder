#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Security Scanner for Git Repository
 * Scans staged files and checks for credential patterns and sensitive files
 */
class SecurityScanner {
  constructor() {
    // Credential detection patterns based on design document
    this.credentialPatterns = [
      {
        pattern: /[A-Za-z0-9+/]{40,}/g,
        description: 'Base64 encoded secrets (40+ chars)',
        severity: 'high'
      },
      {
        pattern: /sk_[a-zA-Z0-9]{24,}/g,
        description: 'Stripe secret keys',
        severity: 'high'
      },
      {
        pattern: /pk_[a-zA-Z0-9]{24,}/g,
        description: 'Stripe public keys',
        severity: 'medium'
      },
      {
        pattern: /AKIA[0-9A-Z]{16}/g,
        description: 'AWS Access Key ID',
        severity: 'high'
      },
      {
        pattern: /[0-9a-f]{32}/g,
        description: 'MD5 hashes (potential tokens)',
        severity: 'medium'
      },
      {
        pattern: /ghp_[A-Za-z0-9]{36}/g,
        description: 'GitHub personal access tokens',
        severity: 'high'
      },
      {
        pattern: /gho_[A-Za-z0-9]{36}/g,
        description: 'GitHub OAuth tokens',
        severity: 'high'
      },
      {
        pattern: /(?:password|passwd|pwd|secret|token|key|api[_-]?key)\s*[:=]\s*['"]\w+['"]/gi,
        description: 'Common credential assignments',
        severity: 'high'
      }
    ];

    // Sensitive file patterns
    this.sensitiveFilePatterns = [
      /\.pem$/i,
      /\.key$/i,
      /\.p12$/i,
      /\.pfx$/i,
      /\.crt$/i,
      /\.cer$/i,
      /\.der$/i,
      /id_rsa/i,
      /id_dsa/i,
      /\.gpg$/i,
      /\.asc$/i,
      /secrets\.json$/i,
      /credentials\.json$/i,
      /auth\.json$/i,
      /\.env$/i
    ];

    this.findings = [];
  }

  /**
   * Get list of staged files for commit
   */
  getStagedFiles() {
    try {
      const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
      return output.trim().split('\n').filter(file => file.length > 0);
    } catch (error) {
      console.warn('Warning: Could not get staged files. Not in a git repository or no git installed.');
      return [];
    }
  }

  /**
   * Get list of modified files (fallback when no files are staged)
   */
  getModifiedFiles() {
    try {
      const output = execSync('git diff --name-only', { encoding: 'utf8' });
      return output.trim().split('\n').filter(file => file.length > 0);
    } catch (error) {
      console.warn('Warning: Could not get modified files.');
      return [];
    }
  }

  /**
   * Check if a filename matches sensitive file patterns
   */
  isSensitiveFile(filename) {
    return this.sensitiveFilePatterns.some(pattern => pattern.test(filename));
  }

  /**
   * Scan file content for credential patterns
   */
  scanFileContent(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, lineNumber) => {
        this.credentialPatterns.forEach(({ pattern, description, severity }) => {
          const matches = line.match(pattern);
          if (matches) {
            // Filter out obvious false positives
            if (this.isLikelyFalsePositive(line, matches[0])) {
              return;
            }

            this.findings.push({
              file: filePath,
              line: lineNumber + 1,
              pattern: matches[0].substring(0, 20) + (matches[0].length > 20 ? '...' : ''),
              severity,
              description,
              fullLine: line.trim()
            });
          }
        });
      });
    } catch (error) {
      console.warn(`Warning: Could not scan file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Filter out likely false positives
   */
  isLikelyFalsePositive(line, match) {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
      return true;
    }

    // Skip placeholder values
    const placeholderPatterns = [
      /your[_-]?api[_-]?key/i,
      /placeholder/i,
      /example/i,
      /xxx+/i,
      /\*+/,
      /replace[_-]?with/i
    ];

    return placeholderPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Perform comprehensive security scan
   */
  performScan() {
    console.log('🔍 Starting security scan...\n');

    // Get files to scan
    let filesToScan = this.getStagedFiles();
    
    if (filesToScan.length === 0) {
      console.log('No staged files found. Checking modified files...');
      filesToScan = this.getModifiedFiles();
    }

    if (filesToScan.length === 0) {
      console.log('No files to scan. Repository appears clean.');
      return this.generateReport();
    }

    console.log(`Scanning ${filesToScan.length} files:\n`);

    // Check for sensitive files
    filesToScan.forEach(file => {
      console.log(`  📄 ${file}`);
      
      if (this.isSensitiveFile(file)) {
        this.findings.push({
          file,
          line: 0,
          pattern: 'Sensitive file type',
          severity: 'high',
          description: 'File type commonly contains sensitive data',
          fullLine: `Entire file: ${file}`
        });
      }

      // Scan file content
      this.scanFileContent(file);
    });

    return this.generateReport();
  }

  /**
   * Generate security report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🛡️  SECURITY SCAN REPORT');
    console.log('='.repeat(60));

    if (this.findings.length === 0) {
      console.log('✅ No security issues detected!');
      console.log('\nAll scanned files appear safe for commit.');
      return { hasIssues: false, findings: [] };
    }

    // Group findings by severity
    const highSeverity = this.findings.filter(f => f.severity === 'high');
    const mediumSeverity = this.findings.filter(f => f.severity === 'medium');
    const lowSeverity = this.findings.filter(f => f.severity === 'low');

    console.log(`❌ Found ${this.findings.length} potential security issues:\n`);

    // Report high severity issues
    if (highSeverity.length > 0) {
      console.log('🚨 HIGH SEVERITY ISSUES:');
      highSeverity.forEach(finding => {
        console.log(`  📁 ${finding.file}:${finding.line}`);
        console.log(`     Pattern: ${finding.pattern}`);
        console.log(`     Issue: ${finding.description}`);
        if (finding.fullLine && finding.line > 0) {
          console.log(`     Line: ${finding.fullLine}`);
        }
        console.log('');
      });
    }

    // Report medium severity issues
    if (mediumSeverity.length > 0) {
      console.log('⚠️  MEDIUM SEVERITY ISSUES:');
      mediumSeverity.forEach(finding => {
        console.log(`  📁 ${finding.file}:${finding.line}`);
        console.log(`     Pattern: ${finding.pattern}`);
        console.log(`     Issue: ${finding.description}`);
        console.log('');
      });
    }

    // Provide recommendations
    console.log('💡 RECOMMENDATIONS:');
    if (highSeverity.length > 0) {
      console.log('  • Review and remove any actual credentials from files');
      console.log('  • Move sensitive data to environment variables');
      console.log('  • Ensure .env files are in .gitignore');
    }
    console.log('  • Use placeholder values in example files');
    console.log('  • Consider using git-secrets or similar tools for ongoing protection');
    console.log('  • Review .gitignore to ensure sensitive file types are excluded');

    return {
      hasIssues: true,
      findings: this.findings,
      summary: `Found ${this.findings.length} potential issues (${highSeverity.length} high, ${mediumSeverity.length} medium, ${lowSeverity.length} low)`
    };
  }
}

// Run scanner if called directly
if (require.main === module) {
  const scanner = new SecurityScanner();
  const result = scanner.performScan();
  
  // Exit with error code if issues found
  process.exit(result.hasIssues ? 1 : 0);
}

module.exports = SecurityScanner;