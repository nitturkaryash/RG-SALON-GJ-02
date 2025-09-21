// vite.config.ts
import { defineConfig } from "file:///D:/Projects/Earning/RG-SALON-GJ-02/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Projects/Earning/RG-SALON-GJ-02/node_modules/@vitejs/plugin-react/dist/index.js";
import { resolve } from "path";

// vite-plugin-api.js
import express from "file:///D:/Projects/Earning/RG-SALON-GJ-02/node_modules/express/index.js";
import cors from "file:///D:/Projects/Earning/RG-SALON-GJ-02/node_modules/cors/lib/index.js";
import helmet from "file:///D:/Projects/Earning/RG-SALON-GJ-02/node_modules/helmet/index.mjs";
import rateLimit from "file:///D:/Projects/Earning/RG-SALON-GJ-02/node_modules/express-rate-limit/dist/index.mjs";
import { createClient } from "file:///D:/Projects/Earning/RG-SALON-GJ-02/node_modules/@supabase/supabase-js/dist/main/index.js";
import { v4 as uuidv4 } from "file:///D:/Projects/Earning/RG-SALON-GJ-02/node_modules/uuid/dist/esm/index.js";
var supabaseUrl = "https://mtyudylsozncvilibxda.supabase.co";
var supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA";
var supabase = createClient(supabaseUrl, supabaseKey);
function apiPlugin() {
  return {
    name: "api-plugin",
    configureServer(server) {
      const app = express();
      app.use(helmet());
      app.use(cors({
        origin: ["http://localhost:5173", "http://localhost:5174"],
        credentials: true
      }));
      const limiter = rateLimit({
        windowMs: 15 * 60 * 1e3,
        // 15 minutes
        max: 100
        // limit each IP to 100 requests per windowMs
      });
      app.use("/api", limiter);
      app.use(express.json({ limit: "10mb" }));
      app.use(express.urlencoded({ extended: true }));
      function isAuthorized(req) {
        return true;
      }
      app.get("/health", (req, res) => {
        res.json({ status: "OK", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
      });
      app.post("/api/test", (req, res) => {
        console.log("\u{1F9EA} Test endpoint called with body:", req.body);
        res.json({ success: true, message: "Test endpoint working", body: req.body });
      });
      app.get("/api/test-supabase", async (req, res) => {
        try {
          console.log("\u{1F50D} Testing Supabase connection...");
          const { data, error } = await supabase.from("product_master").select("count").limit(1);
          if (error) {
            console.log("\u274C Supabase error:", error);
            return res.status(500).json({ success: false, error: error.message });
          }
          console.log("\u2705 Supabase connection working");
          res.json({ success: true, message: "Supabase connection working", data });
        } catch (err) {
          console.log("\u274C Supabase test error:", err);
          res.status(500).json({ success: false, error: err.message });
        }
      });
      app.post("/api/test-product-insert", async (req, res) => {
        try {
          console.log("\u{1F9EA} Testing simple product insert...");
          console.log("\u{1F9EA} Test 1: Minimal insert...");
          const { data: test1, error: error1 } = await supabase.from("product_master").insert({
            name: "Test Product Minimal",
            hsn_code: "999999"
          }).select();
          if (error1) {
            console.log("\u274C Test 1 error:", error1);
            return res.status(500).json({ success: false, error: error1.message });
          }
          console.log("\u2705 Test 1 successful:", test1);
          res.json({ success: true, message: "Minimal insert test successful", data: test1 });
        } catch (err) {
          console.log("\u274C Insert test error:", err);
          res.status(500).json({ success: false, error: err.message });
        }
      });
      app.get("/api/products", async (req, res) => {
        try {
          const { data: products, error } = await supabase.from("product_master").select("*").order("created_at", { ascending: false });
          if (error) throw error;
          res.json({ success: true, products });
        } catch (error) {
          console.error("Error fetching products:", error);
          res.status(500).json({ success: false, error: "Failed to fetch products" });
        }
      });
      app.post("/api/products", async (req, res) => {
        try {
          console.log("\u{1F4DD} POST /api/products - Request body:", JSON.stringify(req.body, null, 2));
          const {
            name,
            hsn_code,
            gst_percentage,
            price,
            mrp_excl_gst,
            mrp_incl_gst,
            active = true,
            description,
            category,
            product_type,
            stock_quantity = 0,
            user_id
          } = req.body;
          console.log("\u{1F4DD} Parsed data:", { name, hsn_code, gst_percentage, user_id });
          if (!name) {
            console.log("\u274C Validation failed: Product name is required");
            return res.status(400).json({ success: false, error: "Product name is required" });
          }
          if (!hsn_code) {
            console.log("\u274C Validation failed: HSN code is required");
            return res.status(400).json({ success: false, error: "HSN code is required" });
          }
          const productId = uuidv4();
          const now = (/* @__PURE__ */ new Date()).toISOString();
          console.log("\u{1F194} Generated product ID:", productId);
          console.log("\u23F0 Current timestamp:", now);
          console.log("\u{1F50D} Checking for existing products...");
          const { data: existingProducts, error: checkError } = await supabase.from("product_master").select("id, name, hsn_code").or(`name.ilike.${name},hsn_code.eq.${hsn_code}`);
          if (checkError) {
            console.log("\u274C Error checking existing products:", checkError);
            throw checkError;
          }
          console.log("\u{1F50D} Existing products found:", existingProducts?.length || 0);
          if (existingProducts && existingProducts.length > 0) {
            const nameMatch = existingProducts.find(
              (product2) => product2.name.toLowerCase() === name.toLowerCase()
            );
            if (nameMatch) {
              return res.status(409).json({
                success: false,
                error: `A product with the name "${name}" already exists`,
                existing_product: nameMatch
              });
            }
            const hsnMatch = existingProducts.find(
              (product2) => product2.hsn_code === hsn_code
            );
            if (hsnMatch) {
              return res.status(409).json({
                success: false,
                error: `A product with the HSN code "${hsn_code}" already exists: ${hsnMatch.name}`,
                existing_product: hsnMatch
              });
            }
          }
          console.log("\u{1F4BE} Creating product with data:", {
            id: productId,
            name,
            hsn_code,
            gst_percentage: gst_percentage || 0,
            price: price || mrp_excl_gst || 0,
            mrp_excl_gst: mrp_excl_gst || 0,
            mrp_incl_gst: mrp_incl_gst || 0,
            active,
            description: description || "",
            category: category || "",
            product_type: product_type || "",
            stock_quantity: stock_quantity || 0,
            user_id: user_id || null,
            created_at: now,
            updated_at: now
          });
          const { data: product, error: productError } = await supabase.from("product_master").insert({
            id: productId,
            name,
            hsn_code,
            gst_percentage: gst_percentage || 0,
            price: price || mrp_excl_gst || 0,
            mrp_excl_gst: mrp_excl_gst || 0,
            mrp_incl_gst: mrp_incl_gst || 0,
            active,
            description: description || "",
            category: category || "",
            product_type: product_type || "",
            stock_quantity: stock_quantity || 0,
            user_id: user_id || null,
            created_at: now,
            updated_at: now
          }).select().single();
          if (productError) {
            console.log("\u274C Error creating product:", productError);
            throw productError;
          }
          console.log("\u2705 Product created successfully:", product);
          res.json({
            success: true,
            message: "Product created successfully",
            product
          });
        } catch (error) {
          console.error("\u274C Error creating product:", error);
          console.error("\u274C Error details:", JSON.stringify(error, null, 2));
          res.status(500).json({
            success: false,
            error: "Failed to create product",
            details: error.message || "Unknown error"
          });
        }
      });
      app.get("/api/clients", async (req, res) => {
        try {
          const { data: clients, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
          if (error) throw error;
          res.json({ success: true, clients });
        } catch (error) {
          console.error("Error fetching clients:", error);
          res.status(500).json({ success: false, error: "Failed to fetch clients" });
        }
      });
      app.post("/api/clients", async (req, res) => {
        try {
          const {
            name,
            phone,
            email,
            address,
            date_of_birth,
            gender,
            user_id
          } = req.body;
          if (!name) {
            return res.status(400).json({ success: false, error: "Client name is required" });
          }
          if (!phone) {
            return res.status(400).json({ success: false, error: "Client phone is required" });
          }
          const clientId = uuidv4();
          const now = (/* @__PURE__ */ new Date()).toISOString();
          const { data: existingClients, error: checkError } = await supabase.from("clients").select("id, name, phone").eq("phone", phone);
          if (checkError) throw checkError;
          if (existingClients && existingClients.length > 0) {
            return res.status(409).json({
              success: false,
              error: `A client with the phone number "${phone}" already exists: ${existingClients[0].name}`,
              existing_client: existingClients[0]
            });
          }
          const { data: client, error: clientError } = await supabase.from("clients").insert({
            id: clientId,
            name,
            phone,
            email: email || "",
            address: address || "",
            date_of_birth: date_of_birth || null,
            gender: gender || "",
            user_id: user_id || null,
            created_at: now,
            updated_at: now
          }).select().single();
          if (clientError) throw clientError;
          res.json({
            success: true,
            message: "Client created successfully",
            client
          });
        } catch (error) {
          console.error("Error creating client:", error);
          res.status(500).json({ success: false, error: "Failed to create client" });
        }
      });
      app.get("/api/orders", async (req, res) => {
        try {
          const { data: orders, error } = await supabase.from("pos_orders").select(`
              *,
              pos_order_items (*)
            `).order("created_at", { ascending: false });
          if (error) throw error;
          res.json({ success: true, orders });
        } catch (error) {
          console.error("Error fetching orders:", error);
          res.status(500).json({ success: false, error: "Failed to fetch orders" });
        }
      });
      app.post("/api/orders", async (req, res) => {
        try {
          const {
            client_name,
            client_phone,
            items,
            total,
            payment_method = "cash",
            stylist,
            type = "sale",
            consumption_purpose,
            consumption_notes,
            is_salon_consumption = false
          } = req.body;
          if (!client_name || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
              success: false,
              error: "Missing required fields: client_name, items"
            });
          }
          const orderId = uuidv4();
          const now = (/* @__PURE__ */ new Date()).toISOString();
          const { data: order, error: orderError } = await supabase.from("pos_orders").insert({
            id: orderId,
            client_name,
            consumption_purpose,
            consumption_notes,
            total: total || 0,
            type,
            is_salon_consumption,
            status: "completed",
            payment_method,
            created_at: now
          }).select().single();
          if (orderError) throw orderError;
          const orderItems = items.map((item) => ({
            id: uuidv4(),
            pos_order_id: orderId,
            service_id: item.service_id || item.id,
            service_name: item.name || item.service_name,
            service_type: item.type || "service",
            price: item.price || 0,
            quantity: item.quantity || 1,
            gst_percentage: item.gst_percentage || 18,
            hsn_code: item.hsn_code || "",
            created_at: now
          }));
          const { error: itemsError } = await supabase.from("pos_order_items").insert(orderItems);
          if (itemsError) throw itemsError;
          res.json({
            success: true,
            message: "Order created successfully",
            order
          });
        } catch (error) {
          console.error("Error creating order:", error);
          res.status(500).json({ success: false, error: "Failed to create order" });
        }
      });
      app.use((error, req, res, next) => {
        console.error("Unhandled error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
      });
      app.use("/api/*", (req, res) => {
        res.status(404).json({ success: false, error: "API route not found" });
      });
      server.middlewares.use("/api", app);
      server.middlewares.use("/health", app);
    }
  };
}

// vite.config.ts
var __vite_injected_original_dirname = "D:\\Projects\\Earning\\RG-SALON-GJ-02";
var vite_config_default = defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"]
      },
      // Fix esbuild JSX issues
      esbuild: {
        jsx: "automatic",
        jsxDev: false
      }
    }),
    apiPlugin()
  ],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        // Remove console logs in production
        drop_debugger: true
      },
      output: {
        comments: false
      }
    },
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          emotion: ["@emotion/react", "@emotion/styled"],
          mui: ["@mui/material", "@mui/icons-material"],
          router: ["react-router-dom"],
          charts: ["chart.js", "recharts"],
          calendar: ["@fullcalendar/react", "@fullcalendar/daygrid", "@fullcalendar/timegrid"]
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@emotion/react",
      "@emotion/styled",
      "@mui/material",
      "@mui/icons-material",
      "react-router-dom"
    ]
  },
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidml0ZS1wbHVnaW4tYXBpLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcUHJvamVjdHNcXFxcRWFybmluZ1xcXFxSRy1TQUxPTi1HSi0wMlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUHJvamVjdHNcXFxcRWFybmluZ1xcXFxSRy1TQUxPTi1HSi0wMlxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUHJvamVjdHMvRWFybmluZy9SRy1TQUxPTi1HSi0wMi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xyXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGFwaVBsdWdpbiB9IGZyb20gJy4vdml0ZS1wbHVnaW4tYXBpLmpzJztcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3Qoe1xyXG4gICAgICBqc3hJbXBvcnRTb3VyY2U6ICdAZW1vdGlvbi9yZWFjdCcsXHJcbiAgICAgIGJhYmVsOiB7XHJcbiAgICAgICAgcGx1Z2luczogWydAZW1vdGlvbi9iYWJlbC1wbHVnaW4nXSxcclxuICAgICAgfSxcclxuICAgICAgLy8gRml4IGVzYnVpbGQgSlNYIGlzc3Vlc1xyXG4gICAgICBlc2J1aWxkOiB7XHJcbiAgICAgICAganN4OiAnYXV0b21hdGljJyxcclxuICAgICAgICBqc3hEZXY6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgfSksXHJcbiAgICBhcGlQbHVnaW4oKSxcclxuICBdLFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogNTE3MyxcclxuICAgIG9wZW46IHRydWUsXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgb3V0RGlyOiAnZGlzdCcsXHJcbiAgICBzb3VyY2VtYXA6IHRydWUsXHJcbiAgICBtaW5pZnk6ICd0ZXJzZXInLFxyXG4gICAgdGVyc2VyT3B0aW9uczoge1xyXG4gICAgICBjb21wcmVzczoge1xyXG4gICAgICAgIGRyb3BfY29uc29sZTogdHJ1ZSwgLy8gUmVtb3ZlIGNvbnNvbGUgbG9ncyBpbiBwcm9kdWN0aW9uXHJcbiAgICAgICAgZHJvcF9kZWJ1Z2dlcjogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgY29tbWVudHM6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHRhcmdldDogJ2VzMjAyMCcsXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgdmVuZG9yOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxyXG4gICAgICAgICAgZW1vdGlvbjogWydAZW1vdGlvbi9yZWFjdCcsICdAZW1vdGlvbi9zdHlsZWQnXSxcclxuICAgICAgICAgIG11aTogWydAbXVpL21hdGVyaWFsJywgJ0BtdWkvaWNvbnMtbWF0ZXJpYWwnXSxcclxuICAgICAgICAgIHJvdXRlcjogWydyZWFjdC1yb3V0ZXItZG9tJ10sXHJcbiAgICAgICAgICBjaGFydHM6IFsnY2hhcnQuanMnLCAncmVjaGFydHMnXSxcclxuICAgICAgICAgIGNhbGVuZGFyOiBbJ0BmdWxsY2FsZW5kYXIvcmVhY3QnLCAnQGZ1bGxjYWxlbmRhci9kYXlncmlkJywgJ0BmdWxsY2FsZW5kYXIvdGltZWdyaWQnXSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgaW5jbHVkZTogW1xyXG4gICAgICAncmVhY3QnLFxyXG4gICAgICAncmVhY3QtZG9tJyxcclxuICAgICAgJ0BlbW90aW9uL3JlYWN0JyxcclxuICAgICAgJ0BlbW90aW9uL3N0eWxlZCcsXHJcbiAgICAgICdAbXVpL21hdGVyaWFsJyxcclxuICAgICAgJ0BtdWkvaWNvbnMtbWF0ZXJpYWwnLFxyXG4gICAgICAncmVhY3Qtcm91dGVyLWRvbScsXHJcbiAgICBdLFxyXG4gIH0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxyXG4gICAgfSxcclxuICB9LFxyXG59KTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQcm9qZWN0c1xcXFxFYXJuaW5nXFxcXFJHLVNBTE9OLUdKLTAyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQcm9qZWN0c1xcXFxFYXJuaW5nXFxcXFJHLVNBTE9OLUdKLTAyXFxcXHZpdGUtcGx1Z2luLWFwaS5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUHJvamVjdHMvRWFybmluZy9SRy1TQUxPTi1HSi0wMi92aXRlLXBsdWdpbi1hcGkuanNcIjtpbXBvcnQgeyBjcmVhdGVTZXJ2ZXIgfSBmcm9tICdodHRwJztcclxuaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XHJcbmltcG9ydCBjb3JzIGZyb20gJ2NvcnMnO1xyXG5pbXBvcnQgaGVsbWV0IGZyb20gJ2hlbG1ldCc7XHJcbmltcG9ydCByYXRlTGltaXQgZnJvbSAnZXhwcmVzcy1yYXRlLWxpbWl0JztcclxuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSAnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJztcclxuaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSAndXVpZCc7XHJcblxyXG4vLyBJbml0aWFsaXplIFN1cGFiYXNlIGNsaWVudFxyXG5jb25zdCBzdXBhYmFzZVVybCA9ICdodHRwczovL210eXVkeWxzb3puY3ZpbGlieGRhLnN1cGFiYXNlLmNvJztcclxuY29uc3Qgc3VwYWJhc2VLZXkgPSAnZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW0xMGVYVmtlV3h6YjNwdVkzWnBiR2xpZUdSaElpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTkRrNE9URTBNVElzSW1WNGNDSTZNakEyTlRRMk56UXhNbjAuS0pQNlB1M2phaGVFajh3VFBpb1pzUlVOUm5rS0g4OGhjUmd2Uzk3Rk9aQSc7XHJcbmNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KHN1cGFiYXNlVXJsLCBzdXBhYmFzZUtleSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYXBpUGx1Z2luKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiAnYXBpLXBsdWdpbicsXHJcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XHJcbiAgICAgIC8vIENyZWF0ZSBFeHByZXNzIGFwcFxyXG4gICAgICBjb25zdCBhcHAgPSBleHByZXNzKCk7XHJcblxyXG4gICAgICAvLyBTZWN1cml0eSBtaWRkbGV3YXJlXHJcbiAgICAgIGFwcC51c2UoaGVsbWV0KCkpO1xyXG4gICAgICBhcHAudXNlKGNvcnMoe1xyXG4gICAgICAgIG9yaWdpbjogWydodHRwOi8vbG9jYWxob3N0OjUxNzMnLCAnaHR0cDovL2xvY2FsaG9zdDo1MTc0J10sXHJcbiAgICAgICAgY3JlZGVudGlhbHM6IHRydWVcclxuICAgICAgfSkpO1xyXG5cclxuICAgICAgLy8gUmF0ZSBsaW1pdGluZ1xyXG4gICAgICBjb25zdCBsaW1pdGVyID0gcmF0ZUxpbWl0KHtcclxuICAgICAgICB3aW5kb3dNczogMTUgKiA2MCAqIDEwMDAsIC8vIDE1IG1pbnV0ZXNcclxuICAgICAgICBtYXg6IDEwMCAvLyBsaW1pdCBlYWNoIElQIHRvIDEwMCByZXF1ZXN0cyBwZXIgd2luZG93TXNcclxuICAgICAgfSk7XHJcbiAgICAgIGFwcC51c2UoJy9hcGknLCBsaW1pdGVyKTtcclxuXHJcbiAgICAgIC8vIEJvZHkgcGFyc2luZyBtaWRkbGV3YXJlXHJcbiAgICAgIGFwcC51c2UoZXhwcmVzcy5qc29uKHsgbGltaXQ6ICcxMG1iJyB9KSk7XHJcbiAgICAgIGFwcC51c2UoZXhwcmVzcy51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUgfSkpO1xyXG5cclxuICAgICAgLy8gQXV0aG9yaXphdGlvbiBtaWRkbGV3YXJlIChkaXNhYmxlZCBmb3IgZGV2ZWxvcG1lbnQpXHJcbiAgICAgIGZ1bmN0aW9uIGlzQXV0aG9yaXplZChyZXEpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gQWxsb3cgYWxsIHJlcXVlc3RzIGluIGRldmVsb3BtZW50XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEhlYWx0aCBjaGVjayBlbmRwb2ludFxyXG4gICAgICBhcHAuZ2V0KCcvaGVhbHRoJywgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgICAgcmVzLmpzb24oeyBzdGF0dXM6ICdPSycsIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFRlc3QgZW5kcG9pbnRcclxuICAgICAgYXBwLnBvc3QoJy9hcGkvdGVzdCcsIChyZXEsIHJlcykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0VcdURERUEgVGVzdCBlbmRwb2ludCBjYWxsZWQgd2l0aCBib2R5OicsIHJlcS5ib2R5KTtcclxuICAgICAgICByZXMuanNvbih7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6ICdUZXN0IGVuZHBvaW50IHdvcmtpbmcnLCBib2R5OiByZXEuYm9keSB9KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBTdXBhYmFzZSB0ZXN0IGVuZHBvaW50XHJcbiAgICAgIGFwcC5nZXQoJy9hcGkvdGVzdC1zdXBhYmFzZScsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDBEIFRlc3RpbmcgU3VwYWJhc2UgY29ubmVjdGlvbi4uLicpO1xyXG4gICAgICAgICAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAgICAgICAgLmZyb20oJ3Byb2R1Y3RfbWFzdGVyJylcclxuICAgICAgICAgICAgLnNlbGVjdCgnY291bnQnKVxyXG4gICAgICAgICAgICAubGltaXQoMSk7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzRDIFN1cGFiYXNlIGVycm9yOicsIGVycm9yKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzA1IFN1cGFiYXNlIGNvbm5lY3Rpb24gd29ya2luZycpO1xyXG4gICAgICAgICAgcmVzLmpzb24oeyBzdWNjZXNzOiB0cnVlLCBtZXNzYWdlOiAnU3VwYWJhc2UgY29ubmVjdGlvbiB3b3JraW5nJywgZGF0YSB9KTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgU3VwYWJhc2UgdGVzdCBlcnJvcjonLCBlcnIpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBTaW1wbGUgcHJvZHVjdCBpbnNlcnQgdGVzdFxyXG4gICAgICBhcHAucG9zdCgnL2FwaS90ZXN0LXByb2R1Y3QtaW5zZXJ0JywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0VcdURERUEgVGVzdGluZyBzaW1wbGUgcHJvZHVjdCBpbnNlcnQuLi4nKTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gVGVzdCAxOiBKdXN0IHRyeSB0byBpbnNlcnQgbWluaW1hbCBkYXRhXHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNFXHVEREVBIFRlc3QgMTogTWluaW1hbCBpbnNlcnQuLi4nKTtcclxuICAgICAgICAgIGNvbnN0IHsgZGF0YTogdGVzdDEsIGVycm9yOiBlcnJvcjEgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgICAgIC5mcm9tKCdwcm9kdWN0X21hc3RlcicpXHJcbiAgICAgICAgICAgIC5pbnNlcnQoe1xyXG4gICAgICAgICAgICAgIG5hbWU6ICdUZXN0IFByb2R1Y3QgTWluaW1hbCcsXHJcbiAgICAgICAgICAgICAgaHNuX2NvZGU6ICc5OTk5OTknLFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc2VsZWN0KCk7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGlmIChlcnJvcjEpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1Mjc0QyBUZXN0IDEgZXJyb3I6JywgZXJyb3IxKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvcjEubWVzc2FnZSB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBUZXN0IDEgc3VjY2Vzc2Z1bDonLCB0ZXN0MSk7XHJcbiAgICAgICAgICByZXMuanNvbih7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6ICdNaW5pbWFsIGluc2VydCB0ZXN0IHN1Y2Nlc3NmdWwnLCBkYXRhOiB0ZXN0MSB9KTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgSW5zZXJ0IHRlc3QgZXJyb3I6JywgZXJyKTtcclxuICAgICAgICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gUHJvZHVjdHMgQVBJIHJvdXRlc1xyXG4gICAgICBhcHAuZ2V0KCcvYXBpL3Byb2R1Y3RzJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IHsgZGF0YTogcHJvZHVjdHMsIGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgICAgICAuZnJvbSgncHJvZHVjdF9tYXN0ZXInKVxyXG4gICAgICAgICAgICAuc2VsZWN0KCcqJylcclxuICAgICAgICAgICAgLm9yZGVyKCdjcmVhdGVkX2F0JywgeyBhc2NlbmRpbmc6IGZhbHNlIH0pO1xyXG5cclxuICAgICAgICAgIGlmIChlcnJvcikgdGhyb3cgZXJyb3I7XHJcblxyXG4gICAgICAgICAgcmVzLmpzb24oeyBzdWNjZXNzOiB0cnVlLCBwcm9kdWN0cyB9KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgcHJvZHVjdHM6JywgZXJyb3IpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggcHJvZHVjdHMnIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBhcHAucG9zdCgnL2FwaS9wcm9kdWN0cycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0REIFBPU1QgL2FwaS9wcm9kdWN0cyAtIFJlcXVlc3QgYm9keTonLCBKU09OLnN0cmluZ2lmeShyZXEuYm9keSwgbnVsbCwgMikpO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgIGhzbl9jb2RlLFxyXG4gICAgICAgICAgICBnc3RfcGVyY2VudGFnZSxcclxuICAgICAgICAgICAgcHJpY2UsXHJcbiAgICAgICAgICAgIG1ycF9leGNsX2dzdCxcclxuICAgICAgICAgICAgbXJwX2luY2xfZ3N0LFxyXG4gICAgICAgICAgICBhY3RpdmUgPSB0cnVlLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgY2F0ZWdvcnksXHJcbiAgICAgICAgICAgIHByb2R1Y3RfdHlwZSxcclxuICAgICAgICAgICAgc3RvY2tfcXVhbnRpdHkgPSAwLFxyXG4gICAgICAgICAgICB1c2VyX2lkLFxyXG4gICAgICAgICAgfSA9IHJlcS5ib2R5O1xyXG5cclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDREQgUGFyc2VkIGRhdGE6JywgeyBuYW1lLCBoc25fY29kZSwgZ3N0X3BlcmNlbnRhZ2UsIHVzZXJfaWQgfSk7XHJcblxyXG4gICAgICAgICAgaWYgKCFuYW1lKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgVmFsaWRhdGlvbiBmYWlsZWQ6IFByb2R1Y3QgbmFtZSBpcyByZXF1aXJlZCcpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdQcm9kdWN0IG5hbWUgaXMgcmVxdWlyZWQnIH0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICghaHNuX2NvZGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1Mjc0QyBWYWxpZGF0aW9uIGZhaWxlZDogSFNOIGNvZGUgaXMgcmVxdWlyZWQnKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSFNOIGNvZGUgaXMgcmVxdWlyZWQnIH0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IHByb2R1Y3RJZCA9IHV1aWR2NCgpO1xyXG4gICAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNDXHVERDk0IEdlbmVyYXRlZCBwcm9kdWN0IElEOicsIHByb2R1Y3RJZCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHUyM0YwIEN1cnJlbnQgdGltZXN0YW1wOicsIG5vdyk7XHJcblxyXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgcHJvZHVjdCBhbHJlYWR5IGV4aXN0cyB3aXRoIHNhbWUgbmFtZSAoY2FzZS1pbnNlbnNpdGl2ZSlcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMEQgQ2hlY2tpbmcgZm9yIGV4aXN0aW5nIHByb2R1Y3RzLi4uJyk7XHJcbiAgICAgICAgICBjb25zdCB7IGRhdGE6IGV4aXN0aW5nUHJvZHVjdHMsIGVycm9yOiBjaGVja0Vycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgICAgICAuZnJvbSgncHJvZHVjdF9tYXN0ZXInKVxyXG4gICAgICAgICAgICAuc2VsZWN0KCdpZCwgbmFtZSwgaHNuX2NvZGUnKVxyXG4gICAgICAgICAgICAub3IoYG5hbWUuaWxpa2UuJHtuYW1lfSxoc25fY29kZS5lcS4ke2hzbl9jb2RlfWApO1xyXG5cclxuICAgICAgICAgIGlmIChjaGVja0Vycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgRXJyb3IgY2hlY2tpbmcgZXhpc3RpbmcgcHJvZHVjdHM6JywgY2hlY2tFcnJvcik7XHJcbiAgICAgICAgICAgIHRocm93IGNoZWNrRXJyb3I7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMEQgRXhpc3RpbmcgcHJvZHVjdHMgZm91bmQ6JywgZXhpc3RpbmdQcm9kdWN0cz8ubGVuZ3RoIHx8IDApO1xyXG5cclxuICAgICAgICAgIGlmIChleGlzdGluZ1Byb2R1Y3RzICYmIGV4aXN0aW5nUHJvZHVjdHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgZXhhY3QgbmFtZSBtYXRjaCBmaXJzdCAoY2FzZS1pbnNlbnNpdGl2ZSlcclxuICAgICAgICAgICAgY29uc3QgbmFtZU1hdGNoID0gZXhpc3RpbmdQcm9kdWN0cy5maW5kKFxyXG4gICAgICAgICAgICAgIHByb2R1Y3QgPT4gcHJvZHVjdC5uYW1lLnRvTG93ZXJDYXNlKCkgPT09IG5hbWUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKG5hbWVNYXRjaCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwOSkuanNvbih7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGVycm9yOiBgQSBwcm9kdWN0IHdpdGggdGhlIG5hbWUgXCIke25hbWV9XCIgYWxyZWFkeSBleGlzdHNgLFxyXG4gICAgICAgICAgICAgICAgZXhpc3RpbmdfcHJvZHVjdDogbmFtZU1hdGNoLFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgSFNOIGNvZGUgbWF0Y2hcclxuICAgICAgICAgICAgY29uc3QgaHNuTWF0Y2ggPSBleGlzdGluZ1Byb2R1Y3RzLmZpbmQoXHJcbiAgICAgICAgICAgICAgcHJvZHVjdCA9PiBwcm9kdWN0Lmhzbl9jb2RlID09PSBoc25fY29kZVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKGhzbk1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA5KS5qc29uKHtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZXJyb3I6IGBBIHByb2R1Y3Qgd2l0aCB0aGUgSFNOIGNvZGUgXCIke2hzbl9jb2RlfVwiIGFscmVhZHkgZXhpc3RzOiAke2hzbk1hdGNoLm5hbWV9YCxcclxuICAgICAgICAgICAgICAgIGV4aXN0aW5nX3Byb2R1Y3Q6IGhzbk1hdGNoLFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gQ3JlYXRlIHRoZSBwcm9kdWN0XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0JFIENyZWF0aW5nIHByb2R1Y3Qgd2l0aCBkYXRhOicsIHtcclxuICAgICAgICAgICAgaWQ6IHByb2R1Y3RJZCxcclxuICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgaHNuX2NvZGUsXHJcbiAgICAgICAgICAgIGdzdF9wZXJjZW50YWdlOiBnc3RfcGVyY2VudGFnZSB8fCAwLFxyXG4gICAgICAgICAgICBwcmljZTogcHJpY2UgfHwgbXJwX2V4Y2xfZ3N0IHx8IDAsXHJcbiAgICAgICAgICAgIG1ycF9leGNsX2dzdDogbXJwX2V4Y2xfZ3N0IHx8IDAsXHJcbiAgICAgICAgICAgIG1ycF9pbmNsX2dzdDogbXJwX2luY2xfZ3N0IHx8IDAsXHJcbiAgICAgICAgICAgIGFjdGl2ZSxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uIHx8ICcnLFxyXG4gICAgICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnkgfHwgJycsXHJcbiAgICAgICAgICAgIHByb2R1Y3RfdHlwZTogcHJvZHVjdF90eXBlIHx8ICcnLFxyXG4gICAgICAgICAgICBzdG9ja19xdWFudGl0eTogc3RvY2tfcXVhbnRpdHkgfHwgMCxcclxuICAgICAgICAgICAgdXNlcl9pZDogdXNlcl9pZCB8fCBudWxsLFxyXG4gICAgICAgICAgICBjcmVhdGVkX2F0OiBub3csXHJcbiAgICAgICAgICAgIHVwZGF0ZWRfYXQ6IG5vdyxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBjb25zdCB7IGRhdGE6IHByb2R1Y3QsIGVycm9yOiBwcm9kdWN0RXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgICAgIC5mcm9tKCdwcm9kdWN0X21hc3RlcicpXHJcbiAgICAgICAgICAgIC5pbnNlcnQoe1xyXG4gICAgICAgICAgICAgIGlkOiBwcm9kdWN0SWQsXHJcbiAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICBoc25fY29kZSxcclxuICAgICAgICAgICAgICBnc3RfcGVyY2VudGFnZTogZ3N0X3BlcmNlbnRhZ2UgfHwgMCxcclxuICAgICAgICAgICAgICBwcmljZTogcHJpY2UgfHwgbXJwX2V4Y2xfZ3N0IHx8IDAsXHJcbiAgICAgICAgICAgICAgbXJwX2V4Y2xfZ3N0OiBtcnBfZXhjbF9nc3QgfHwgMCxcclxuICAgICAgICAgICAgICBtcnBfaW5jbF9nc3Q6IG1ycF9pbmNsX2dzdCB8fCAwLFxyXG4gICAgICAgICAgICAgIGFjdGl2ZSxcclxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24gfHwgJycsXHJcbiAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5IHx8ICcnLFxyXG4gICAgICAgICAgICAgIHByb2R1Y3RfdHlwZTogcHJvZHVjdF90eXBlIHx8ICcnLFxyXG4gICAgICAgICAgICAgIHN0b2NrX3F1YW50aXR5OiBzdG9ja19xdWFudGl0eSB8fCAwLFxyXG4gICAgICAgICAgICAgIHVzZXJfaWQ6IHVzZXJfaWQgfHwgbnVsbCxcclxuICAgICAgICAgICAgICBjcmVhdGVkX2F0OiBub3csXHJcbiAgICAgICAgICAgICAgdXBkYXRlZF9hdDogbm93LFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc2VsZWN0KClcclxuICAgICAgICAgICAgLnNpbmdsZSgpO1xyXG5cclxuICAgICAgICAgIGlmIChwcm9kdWN0RXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1Mjc0QyBFcnJvciBjcmVhdGluZyBwcm9kdWN0OicsIHByb2R1Y3RFcnJvcik7XHJcbiAgICAgICAgICAgIHRocm93IHByb2R1Y3RFcnJvcjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBQcm9kdWN0IGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5OicsIHByb2R1Y3QpO1xyXG5cclxuICAgICAgICAgIHJlcy5qc29uKHtcclxuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgICAgbWVzc2FnZTogJ1Byb2R1Y3QgY3JlYXRlZCBzdWNjZXNzZnVsbHknLFxyXG4gICAgICAgICAgICBwcm9kdWN0LFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBFcnJvciBjcmVhdGluZyBwcm9kdWN0OicsIGVycm9yKTtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBFcnJvciBkZXRhaWxzOicsIEpTT04uc3RyaW5naWZ5KGVycm9yLCBudWxsLCAyKSk7XHJcbiAgICAgICAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXHJcbiAgICAgICAgICAgIGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSBwcm9kdWN0JyxcclxuICAgICAgICAgICAgZGV0YWlsczogZXJyb3IubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvcidcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBDbGllbnRzIEFQSSByb3V0ZXNcclxuICAgICAgYXBwLmdldCgnL2FwaS9jbGllbnRzJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IHsgZGF0YTogY2xpZW50cywgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgICAgIC5mcm9tKCdjbGllbnRzJylcclxuICAgICAgICAgICAgLnNlbGVjdCgnKicpXHJcbiAgICAgICAgICAgIC5vcmRlcignY3JlYXRlZF9hdCcsIHsgYXNjZW5kaW5nOiBmYWxzZSB9KTtcclxuXHJcbiAgICAgICAgICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xyXG5cclxuICAgICAgICAgIHJlcy5qc29uKHsgc3VjY2VzczogdHJ1ZSwgY2xpZW50cyB9KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgY2xpZW50czonLCBlcnJvcik7XHJcbiAgICAgICAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBjbGllbnRzJyB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgYXBwLnBvc3QoJy9hcGkvY2xpZW50cycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgIHBob25lLFxyXG4gICAgICAgICAgICBlbWFpbCxcclxuICAgICAgICAgICAgYWRkcmVzcyxcclxuICAgICAgICAgICAgZGF0ZV9vZl9iaXJ0aCxcclxuICAgICAgICAgICAgZ2VuZGVyLFxyXG4gICAgICAgICAgICB1c2VyX2lkLFxyXG4gICAgICAgICAgfSA9IHJlcS5ib2R5O1xyXG5cclxuICAgICAgICAgIGlmICghbmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdDbGllbnQgbmFtZSBpcyByZXF1aXJlZCcgfSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCFwaG9uZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdDbGllbnQgcGhvbmUgaXMgcmVxdWlyZWQnIH0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IGNsaWVudElkID0gdXVpZHY0KCk7XHJcbiAgICAgICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XHJcblxyXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgY2xpZW50IGFscmVhZHkgZXhpc3RzIHdpdGggc2FtZSBwaG9uZVxyXG4gICAgICAgICAgY29uc3QgeyBkYXRhOiBleGlzdGluZ0NsaWVudHMsIGVycm9yOiBjaGVja0Vycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgICAgICAuZnJvbSgnY2xpZW50cycpXHJcbiAgICAgICAgICAgIC5zZWxlY3QoJ2lkLCBuYW1lLCBwaG9uZScpXHJcbiAgICAgICAgICAgIC5lcSgncGhvbmUnLCBwaG9uZSk7XHJcblxyXG4gICAgICAgICAgaWYgKGNoZWNrRXJyb3IpIHRocm93IGNoZWNrRXJyb3I7XHJcblxyXG4gICAgICAgICAgaWYgKGV4aXN0aW5nQ2xpZW50cyAmJiBleGlzdGluZ0NsaWVudHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDkpLmpzb24oe1xyXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgICAgIGVycm9yOiBgQSBjbGllbnQgd2l0aCB0aGUgcGhvbmUgbnVtYmVyIFwiJHtwaG9uZX1cIiBhbHJlYWR5IGV4aXN0czogJHtleGlzdGluZ0NsaWVudHNbMF0ubmFtZX1gLFxyXG4gICAgICAgICAgICAgIGV4aXN0aW5nX2NsaWVudDogZXhpc3RpbmdDbGllbnRzWzBdLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBDcmVhdGUgdGhlIGNsaWVudFxyXG4gICAgICAgICAgY29uc3QgeyBkYXRhOiBjbGllbnQsIGVycm9yOiBjbGllbnRFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAgICAgICAgLmZyb20oJ2NsaWVudHMnKVxyXG4gICAgICAgICAgICAuaW5zZXJ0KHtcclxuICAgICAgICAgICAgICBpZDogY2xpZW50SWQsXHJcbiAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICBwaG9uZSxcclxuICAgICAgICAgICAgICBlbWFpbDogZW1haWwgfHwgJycsXHJcbiAgICAgICAgICAgICAgYWRkcmVzczogYWRkcmVzcyB8fCAnJyxcclxuICAgICAgICAgICAgICBkYXRlX29mX2JpcnRoOiBkYXRlX29mX2JpcnRoIHx8IG51bGwsXHJcbiAgICAgICAgICAgICAgZ2VuZGVyOiBnZW5kZXIgfHwgJycsXHJcbiAgICAgICAgICAgICAgdXNlcl9pZDogdXNlcl9pZCB8fCBudWxsLFxyXG4gICAgICAgICAgICAgIGNyZWF0ZWRfYXQ6IG5vdyxcclxuICAgICAgICAgICAgICB1cGRhdGVkX2F0OiBub3csXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zZWxlY3QoKVxyXG4gICAgICAgICAgICAuc2luZ2xlKCk7XHJcblxyXG4gICAgICAgICAgaWYgKGNsaWVudEVycm9yKSB0aHJvdyBjbGllbnRFcnJvcjtcclxuXHJcbiAgICAgICAgICByZXMuanNvbih7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdDbGllbnQgY3JlYXRlZCBzdWNjZXNzZnVsbHknLFxyXG4gICAgICAgICAgICBjbGllbnQsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgY2xpZW50OicsIGVycm9yKTtcclxuICAgICAgICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSBjbGllbnQnIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBPcmRlcnMgQVBJIHJvdXRlc1xyXG4gICAgICBhcHAuZ2V0KCcvYXBpL29yZGVycycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCB7IGRhdGE6IG9yZGVycywgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgICAgIC5mcm9tKCdwb3Nfb3JkZXJzJylcclxuICAgICAgICAgICAgLnNlbGVjdChgXHJcbiAgICAgICAgICAgICAgKixcclxuICAgICAgICAgICAgICBwb3Nfb3JkZXJfaXRlbXMgKCopXHJcbiAgICAgICAgICAgIGApXHJcbiAgICAgICAgICAgIC5vcmRlcignY3JlYXRlZF9hdCcsIHsgYXNjZW5kaW5nOiBmYWxzZSB9KTtcclxuXHJcbiAgICAgICAgICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xyXG5cclxuICAgICAgICAgIHJlcy5qc29uKHsgc3VjY2VzczogdHJ1ZSwgb3JkZXJzIH0pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBvcmRlcnM6JywgZXJyb3IpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggb3JkZXJzJyB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgYXBwLnBvc3QoJy9hcGkvb3JkZXJzJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IHtcclxuICAgICAgICAgICAgY2xpZW50X25hbWUsXHJcbiAgICAgICAgICAgIGNsaWVudF9waG9uZSxcclxuICAgICAgICAgICAgaXRlbXMsXHJcbiAgICAgICAgICAgIHRvdGFsLFxyXG4gICAgICAgICAgICBwYXltZW50X21ldGhvZCA9ICdjYXNoJyxcclxuICAgICAgICAgICAgc3R5bGlzdCxcclxuICAgICAgICAgICAgdHlwZSA9ICdzYWxlJyxcclxuICAgICAgICAgICAgY29uc3VtcHRpb25fcHVycG9zZSxcclxuICAgICAgICAgICAgY29uc3VtcHRpb25fbm90ZXMsXHJcbiAgICAgICAgICAgIGlzX3NhbG9uX2NvbnN1bXB0aW9uID0gZmFsc2UsXHJcbiAgICAgICAgICB9ID0gcmVxLmJvZHk7XHJcblxyXG4gICAgICAgICAgaWYgKCFjbGllbnRfbmFtZSB8fCAhaXRlbXMgfHwgIUFycmF5LmlzQXJyYXkoaXRlbXMpIHx8IGl0ZW1zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oe1xyXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgICAgIGVycm9yOiAnTWlzc2luZyByZXF1aXJlZCBmaWVsZHM6IGNsaWVudF9uYW1lLCBpdGVtcycsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IG9yZGVySWQgPSB1dWlkdjQoKTtcclxuICAgICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcclxuXHJcbiAgICAgICAgICAvLyBDcmVhdGUgdGhlIG9yZGVyXHJcbiAgICAgICAgICBjb25zdCB7IGRhdGE6IG9yZGVyLCBlcnJvcjogb3JkZXJFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAgICAgICAgLmZyb20oJ3Bvc19vcmRlcnMnKVxyXG4gICAgICAgICAgICAuaW5zZXJ0KHtcclxuICAgICAgICAgICAgICBpZDogb3JkZXJJZCxcclxuICAgICAgICAgICAgICBjbGllbnRfbmFtZSxcclxuICAgICAgICAgICAgICBjb25zdW1wdGlvbl9wdXJwb3NlLFxyXG4gICAgICAgICAgICAgIGNvbnN1bXB0aW9uX25vdGVzLFxyXG4gICAgICAgICAgICAgIHRvdGFsOiB0b3RhbCB8fCAwLFxyXG4gICAgICAgICAgICAgIHR5cGUsXHJcbiAgICAgICAgICAgICAgaXNfc2Fsb25fY29uc3VtcHRpb24sXHJcbiAgICAgICAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJyxcclxuICAgICAgICAgICAgICBwYXltZW50X21ldGhvZCxcclxuICAgICAgICAgICAgICBjcmVhdGVkX2F0OiBub3csXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zZWxlY3QoKVxyXG4gICAgICAgICAgICAuc2luZ2xlKCk7XHJcblxyXG4gICAgICAgICAgaWYgKG9yZGVyRXJyb3IpIHRocm93IG9yZGVyRXJyb3I7XHJcblxyXG4gICAgICAgICAgLy8gQ3JlYXRlIG9yZGVyIGl0ZW1zXHJcbiAgICAgICAgICBjb25zdCBvcmRlckl0ZW1zID0gaXRlbXMubWFwKChpdGVtKSA9PiAoe1xyXG4gICAgICAgICAgICBpZDogdXVpZHY0KCksXHJcbiAgICAgICAgICAgIHBvc19vcmRlcl9pZDogb3JkZXJJZCxcclxuICAgICAgICAgICAgc2VydmljZV9pZDogaXRlbS5zZXJ2aWNlX2lkIHx8IGl0ZW0uaWQsXHJcbiAgICAgICAgICAgIHNlcnZpY2VfbmFtZTogaXRlbS5uYW1lIHx8IGl0ZW0uc2VydmljZV9uYW1lLFxyXG4gICAgICAgICAgICBzZXJ2aWNlX3R5cGU6IGl0ZW0udHlwZSB8fCAnc2VydmljZScsXHJcbiAgICAgICAgICAgIHByaWNlOiBpdGVtLnByaWNlIHx8IDAsXHJcbiAgICAgICAgICAgIHF1YW50aXR5OiBpdGVtLnF1YW50aXR5IHx8IDEsXHJcbiAgICAgICAgICAgIGdzdF9wZXJjZW50YWdlOiBpdGVtLmdzdF9wZXJjZW50YWdlIHx8IDE4LFxyXG4gICAgICAgICAgICBoc25fY29kZTogaXRlbS5oc25fY29kZSB8fCAnJyxcclxuICAgICAgICAgICAgY3JlYXRlZF9hdDogbm93LFxyXG4gICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHsgZXJyb3I6IGl0ZW1zRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgICAgIC5mcm9tKCdwb3Nfb3JkZXJfaXRlbXMnKVxyXG4gICAgICAgICAgICAuaW5zZXJ0KG9yZGVySXRlbXMpO1xyXG5cclxuICAgICAgICAgIGlmIChpdGVtc0Vycm9yKSB0aHJvdyBpdGVtc0Vycm9yO1xyXG5cclxuICAgICAgICAgIHJlcy5qc29uKHtcclxuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgICAgbWVzc2FnZTogJ09yZGVyIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5JyxcclxuICAgICAgICAgICAgb3JkZXIsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgb3JkZXI6JywgZXJyb3IpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdGYWlsZWQgdG8gY3JlYXRlIG9yZGVyJyB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gRXJyb3IgaGFuZGxpbmcgbWlkZGxld2FyZVxyXG4gICAgICBhcHAudXNlKChlcnJvciwgcmVxLCByZXMsIG5leHQpID0+IHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdVbmhhbmRsZWQgZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyB9KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyA0MDQgaGFuZGxlciBmb3IgQVBJIHJvdXRlcyBvbmx5XHJcbiAgICAgIGFwcC51c2UoJy9hcGkvKicsIChyZXEsIHJlcykgPT4ge1xyXG4gICAgICAgIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnQVBJIHJvdXRlIG5vdCBmb3VuZCcgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gTW91bnQgdGhlIEV4cHJlc3MgYXBwIG9uIHRoZSBWaXRlIHNlcnZlciwgYnV0IG9ubHkgZm9yIEFQSSByb3V0ZXNcclxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaScsIGFwcCk7XHJcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9oZWFsdGgnLCBhcHApO1xyXG4gICAgfSxcclxuICB9O1xyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1MsU0FBUyxvQkFBb0I7QUFDN1QsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTs7O0FDRHhCLE9BQU8sYUFBYTtBQUNwQixPQUFPLFVBQVU7QUFDakIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sZUFBZTtBQUN0QixTQUFTLG9CQUFvQjtBQUM3QixTQUFTLE1BQU0sY0FBYztBQUc3QixJQUFNLGNBQWM7QUFDcEIsSUFBTSxjQUFjO0FBQ3BCLElBQU0sV0FBVyxhQUFhLGFBQWEsV0FBVztBQUUvQyxTQUFTLFlBQVk7QUFDMUIsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sZ0JBQWdCLFFBQVE7QUFFdEIsWUFBTSxNQUFNLFFBQVE7QUFHcEIsVUFBSSxJQUFJLE9BQU8sQ0FBQztBQUNo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QUFHRCxhQUFPLFlBQVksSUFBSSxRQUFRLEdBQUc7QUFDbEMsYUFBTyxZQUFZLElBQUksV0FBVyxHQUFHO0FBQUEsSUFDdkM7QUFBQSxFQUNGO0FBQ0Y7OztBRC9jQSxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsTUFDSixpQkFBaUI7QUFBQSxNQUNqQixPQUFPO0FBQUEsUUFDTCxTQUFTLENBQUMsdUJBQXVCO0FBQUEsTUFDbkM7QUFBQTtBQUFBLE1BRUEsU0FBUztBQUFBLFFBQ1AsS0FBSztBQUFBLFFBQ0wsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUNELFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsVUFBVTtBQUFBLFFBQ1IsY0FBYztBQUFBO0FBQUEsUUFDZCxlQUFlO0FBQUEsTUFDakI7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOLFVBQVU7QUFBQSxNQUNaO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLFVBQzdCLFNBQVMsQ0FBQyxrQkFBa0IsaUJBQWlCO0FBQUEsVUFDN0MsS0FBSyxDQUFDLGlCQUFpQixxQkFBcUI7QUFBQSxVQUM1QyxRQUFRLENBQUMsa0JBQWtCO0FBQUEsVUFDM0IsUUFBUSxDQUFDLFlBQVksVUFBVTtBQUFBLFVBQy9CLFVBQVUsQ0FBQyx1QkFBdUIseUJBQXlCLHdCQUF3QjtBQUFBLFFBQ3JGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLFFBQVEsa0NBQVcsS0FBSztBQUFBLElBQy9CO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbInByb2R1Y3QiXQp9Cg==
