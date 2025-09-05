@@ .. @@
     @GetMapping("/admin/{queueId}")
     public String adminDashboard(@PathVariable String queueId, Model model) {
         model.addAttribute("queueId", queueId);
-        return "admin-dashboard";
+        return "admin/admin-dashboard";
     }
 
     @GetMapping("/visitor/{queueId}")
     public String visitorJoin(@PathVariable String queueId, Model model) {
         model.addAttribute("queueId", queueId);
-        return "visitor-join";
+        return "visitor/visitor-join";
     }
 
     @GetMapping("/status/{queueId}")
     public String queueStatus(@PathVariable String queueId, Model model) {
         model.addAttribute("queueId", queueId);
-        return "status";
+        return "status/status";
     }
 
     @GetMapping("/poster/{queueId}")
     public String queuePoster(@PathVariable String queueId, Model model) {
         model.addAttribute("queueId", queueId);
-        return "poster";
+        return "poster/poster";
     }