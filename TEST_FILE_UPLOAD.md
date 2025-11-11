# File Upload Testing Guide

**Feature:** Designer Profile Photo Upload
**Status:** Ready for Testing
**Time Required:** 5 minutes

---

## Quick Start

### Access the Feature
1. Open browser: **http://localhost:3009/designer/profile**
2. Sign in if needed
3. Scroll to **"Profile Picture"** section at top
4. Click blue **"Upload Photo"** button

### Upload a Photo
1. Select a JPG or PNG image from your computer (under 5MB)
2. Click "Open" to upload
3. See "Uploading..." status on button
4. Green success message appears
5. Message auto-closes after 4 seconds

---

## Test Cases

### Test 1: Valid Upload (JPG)
**Expected:** ✅ Success
```
1. Click "Upload Photo"
2. Select any .JPG file (< 5MB)
3. Click "Open"
→ See: "Profile photo updated successfully! File: [filename.jpg]"
→ Button changes back to "Upload Photo"
→ Message disappears after 4 seconds
```

### Test 2: Valid Upload (PNG)
**Expected:** ✅ Success
```
1. Click "Upload Photo"
2. Select any .PNG file (< 5MB)
3. Click "Open"
→ Same success behavior as Test 1
```

### Test 3: Invalid File Type (PDF)
**Expected:** ❌ Error
```
1. Click "Upload Photo"
2. Select any .PDF file
3. Click "Open"
→ See red error: "Invalid file type. Please upload a JPG or PNG image."
→ Modal closes, file NOT uploaded
→ Error message disappears after 4 seconds
```

### Test 4: Invalid File Type (Word Doc)
**Expected:** ❌ Error
```
1. Click "Upload Photo"
2. Select any .DOCX or .DOC file
3. Click "Open"
→ See red error: "Invalid file type. Please upload a JPG or PNG image."
→ Error disappears after 4 seconds
```

### Test 5: File Too Large (> 5MB)
**Expected:** ❌ Error
```
1. Click "Upload Photo"
2. Select or create a JPG/PNG file > 5MB
3. Click "Open"
→ See red error: "File is too large. Maximum size is 5MB."
→ File NOT uploaded
→ Error disappears after 4 seconds
```

### Test 6: Button Disabled During Upload
**Expected:** ✅ Disabled
```
1. Click "Upload Photo"
2. Select a large JPG file (1-5MB)
3. While uploading, button should show "Uploading..."
4. Button should be disabled (not clickable)
→ Can't click multiple times simultaneously
→ Prevents duplicate uploads
```

### Test 7: Multiple Uploads in Sequence
**Expected:** ✅ Works
```
1. Upload photo 1 (JPG)
   → Success message
2. Wait 2 seconds
3. Upload photo 2 (PNG)
   → Success message
4. Try uploading 5 different photos
   → All succeed
→ Shows file upload is repeatable
```

### Test 8: Cancel Upload (Close Modal)
**Expected:** ✅ Upload cancelled
```
1. Click "Upload Photo"
2. Select a file
3. Don't click "Open" - click Cancel or close dialog
→ Nothing uploads
→ No error messages
```

---

## Visual Checklist

- [ ] Button visible in Profile Picture section
- [ ] Button has camera icon
- [ ] Button text says "Upload Photo"
- [ ] Success message is GREEN
- [ ] Error messages are RED
- [ ] Button disables during upload
- [ ] Button changes text to "Uploading..."
- [ ] File picker shows only images by default
- [ ] Messages auto-close

---

## Expected Outcomes

### Successful Upload
```
✅ Green Alert Box
Profile photo updated successfully!
File: [your-filename.jpg]
(auto-closes after 4 seconds)
```

### Invalid File Type
```
❌ Red Alert Box
Invalid file type. Please upload a JPG or PNG image.
(auto-closes after 4 seconds)
```

### File Too Large
```
❌ Red Alert Box
File is too large. Maximum size is 5MB.
(auto-closes after 4 seconds)
```

---

## Device Testing

### Desktop Testing
- [ ] Chrome browser
- [ ] Firefox browser
- [ ] Edge browser
- [ ] Safari browser

### Mobile Testing
- [ ] Tablet (landscape)
- [ ] Tablet (portrait)
- [ ] Phone
- [ ] Small phone

---

## Troubleshooting

### Issue: Button not appearing
**Solution:**
1. Hard refresh: Ctrl+F5
2. Clear browser cache
3. Check you're logged in
4. Check URL is correct

### Issue: Upload seems to hang
**Solution:**
1. Wait 10 seconds
2. Check browser console (F12)
3. Look for error messages
4. Try refreshing page

### Issue: Wrong error message
**Solution:**
1. Check file type (must be JPG/PNG)
2. Check file size (must be < 5MB)
3. Check file not corrupted
4. Try different image

### Issue: Can't select file
**Solution:**
1. Click button again
2. Browser file dialog should appear
3. If not, check browser permissions
4. Try different browser

---

## File Requirements

### Supported Formats
- ✅ JPG / JPEG
- ✅ PNG
- ✅ WebP
- ❌ GIF (will show error)
- ❌ PDF (will show error)
- ❌ SVG (will show error)
- ❌ Word (will show error)

### Size Limits
- **Maximum:** 5MB
- **Recommended:** 1-3MB for faster uploads
- **Minimum:** No minimum (any non-zero file)

### Example Filenames (Valid)
- profile.jpg ✅
- avatar.png ✅
- photo.jpeg ✅
- my-picture.webp ✅

### Example Filenames (Invalid)
- document.pdf ❌
- spreadsheet.xlsx ❌
- archive.zip ❌
- video.mp4 ❌

---

## Test Results Template

Copy this and fill in as you test:

```
TEST DATE: ____________
TESTER: ________________
BROWSER: _______________
OS: ____________________

TEST 1 - Valid JPG Upload:
  Result: [ ] PASS [ ] FAIL
  Notes: ________________________

TEST 2 - Valid PNG Upload:
  Result: [ ] PASS [ ] FAIL
  Notes: ________________________

TEST 3 - Invalid File Type (PDF):
  Result: [ ] PASS [ ] FAIL
  Notes: ________________________

TEST 4 - File Too Large:
  Result: [ ] PASS [ ] FAIL
  Notes: ________________________

TEST 5 - Button Disabled During Upload:
  Result: [ ] PASS [ ] FAIL
  Notes: ________________________

TEST 6 - Multiple Uploads:
  Result: [ ] PASS [ ] FAIL
  Notes: ________________________

OVERALL RESULT: [ ] PASS [ ] FAIL
ISSUES FOUND: ___________________
```

---

## Success Indicators

✅ All tests pass when:
1. Valid JPG/PNG uploads succeed with green message
2. Invalid file types show red error
3. Large files show size error
4. Button disables during upload
5. Multiple uploads work
6. Messages auto-close
7. Works on desktop and mobile

---

## Next Steps After Testing

1. **If All Tests Pass:**
   - Feature is working correctly
   - Ready for production
   - Document any custom needs

2. **If Tests Fail:**
   - Check error messages in browser console (F12)
   - Verify API endpoint is working
   - Check network requests
   - Report specific test failures

3. **Additional Features to Request:**
   - Drag & drop upload
   - Image preview before upload
   - Cropping/resizing
   - Multiple file selection
   - Storage persistence

---

## Contact & Support

For issues with file upload:
1. Check this guide first
2. Check FILE_UPLOAD_FIX.md for details
3. Check browser console for errors (F12)
4. Test with different file/browser

---

**Ready to test? Start with Test 1: Valid JPG Upload!**

Time to complete all tests: **5-10 minutes**
