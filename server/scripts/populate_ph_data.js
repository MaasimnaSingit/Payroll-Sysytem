const sqlite3 = require('better-sqlite3');
const path = require('path');

// Get database path
const DB_PATH = process.env.DB_PATH || path.join(process.env.APPDATA || process.env.HOME, 'tgps-payroll', 'payroll_system.db');

// Create database connection
const db = new sqlite3(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Insert SSS 2024 rates
const sssRates = [
  { range_start: 1000, range_end: 3249.99, employee_contribution: 135.00, employer_contribution: 135.00 },
  { range_start: 3250, range_end: 3749.99, employee_contribution: 157.50, employer_contribution: 157.50 },
  { range_start: 3750, range_end: 4249.99, employee_contribution: 180.00, employer_contribution: 180.00 },
  { range_start: 4250, range_end: 4749.99, employee_contribution: 202.50, employer_contribution: 202.50 },
  { range_start: 4750, range_end: 5249.99, employee_contribution: 225.00, employer_contribution: 225.00 },
  { range_start: 5250, range_end: 5749.99, employee_contribution: 247.50, employer_contribution: 247.50 },
  { range_start: 5750, range_end: 6249.99, employee_contribution: 270.00, employer_contribution: 270.00 },
  { range_start: 6250, range_end: 6749.99, employee_contribution: 292.50, employer_contribution: 292.50 },
  { range_start: 6750, range_end: 7249.99, employee_contribution: 315.00, employer_contribution: 315.00 },
  { range_start: 7250, range_end: 7749.99, employee_contribution: 337.50, employer_contribution: 337.50 },
  { range_start: 7750, range_end: 8249.99, employee_contribution: 360.00, employer_contribution: 360.00 },
  { range_start: 8250, range_end: 8749.99, employee_contribution: 382.50, employer_contribution: 382.50 },
  { range_start: 8750, range_end: 9249.99, employee_contribution: 405.00, employer_contribution: 405.00 },
  { range_start: 9250, range_end: 9749.99, employee_contribution: 427.50, employer_contribution: 427.50 },
  { range_start: 9750, range_end: 10249.99, employee_contribution: 450.00, employer_contribution: 450.00 },
  { range_start: 10250, range_end: 10749.99, employee_contribution: 472.50, employer_contribution: 472.50 },
  { range_start: 10750, range_end: 11249.99, employee_contribution: 495.00, employer_contribution: 495.00 },
  { range_start: 11250, range_end: 11749.99, employee_contribution: 517.50, employer_contribution: 517.50 },
  { range_start: 11750, range_end: 12249.99, employee_contribution: 540.00, employer_contribution: 540.00 },
  { range_start: 12250, range_end: 12749.99, employee_contribution: 562.50, employer_contribution: 562.50 },
  { range_start: 12750, range_end: 13249.99, employee_contribution: 585.00, employer_contribution: 585.00 },
  { range_start: 13250, range_end: 13749.99, employee_contribution: 607.50, employer_contribution: 607.50 },
  { range_start: 13750, range_end: 14249.99, employee_contribution: 630.00, employer_contribution: 630.00 },
  { range_start: 14250, range_end: 14749.99, employee_contribution: 652.50, employer_contribution: 652.50 },
  { range_start: 14750, range_end: 15249.99, employee_contribution: 675.00, employer_contribution: 675.00 },
  { range_start: 15250, range_end: 15749.99, employee_contribution: 697.50, employer_contribution: 697.50 },
  { range_start: 15750, range_end: 16249.99, employee_contribution: 720.00, employer_contribution: 720.00 },
  { range_start: 16250, range_end: 16749.99, employee_contribution: 742.50, employer_contribution: 742.50 },
  { range_start: 16750, range_end: 17249.99, employee_contribution: 765.00, employer_contribution: 765.00 },
  { range_start: 17250, range_end: 17749.99, employee_contribution: 787.50, employer_contribution: 787.50 },
  { range_start: 17750, range_end: 18249.99, employee_contribution: 810.00, employer_contribution: 810.00 },
  { range_start: 18250, range_end: 18749.99, employee_contribution: 832.50, employer_contribution: 832.50 },
  { range_start: 18750, range_end: 19249.99, employee_contribution: 855.00, employer_contribution: 855.00 },
  { range_start: 19250, range_end: 19749.99, employee_contribution: 877.50, employer_contribution: 877.50 },
  { range_start: 19750, range_end: 20249.99, employee_contribution: 900.00, employer_contribution: 900.00 },
  { range_start: 20250, range_end: 20749.99, employee_contribution: 922.50, employer_contribution: 922.50 },
  { range_start: 20750, range_end: 21249.99, employee_contribution: 945.00, employer_contribution: 945.00 },
  { range_start: 21250, range_end: 21749.99, employee_contribution: 967.50, employer_contribution: 967.50 },
  { range_start: 21750, range_end: 22249.99, employee_contribution: 990.00, employer_contribution: 990.00 },
  { range_start: 22250, range_end: 22749.99, employee_contribution: 1012.50, employer_contribution: 1012.50 },
  { range_start: 22750, range_end: 23249.99, employee_contribution: 1035.00, employer_contribution: 1035.00 },
  { range_start: 23250, range_end: 23749.99, employee_contribution: 1057.50, employer_contribution: 1057.50 },
  { range_start: 23750, range_end: 24249.99, employee_contribution: 1080.00, employer_contribution: 1080.00 },
  { range_start: 24250, range_end: 24749.99, employee_contribution: 1102.50, employer_contribution: 1102.50 },
  { range_start: 24750, range_end: 25249.99, employee_contribution: 1125.00, employer_contribution: 1125.00 },
  { range_start: 25250, range_end: 25749.99, employee_contribution: 1147.50, employer_contribution: 1147.50 },
  { range_start: 25750, range_end: 26249.99, employee_contribution: 1170.00, employer_contribution: 1170.00 },
  { range_start: 26250, range_end: 26749.99, employee_contribution: 1192.50, employer_contribution: 1192.50 },
  { range_start: 26750, range_end: 27249.99, employee_contribution: 1215.00, employer_contribution: 1215.00 },
  { range_start: 27250, range_end: 27749.99, employee_contribution: 1237.50, employer_contribution: 1237.50 },
  { range_start: 27750, range_end: 28249.99, employee_contribution: 1260.00, employer_contribution: 1260.00 },
  { range_start: 28250, range_end: 28749.99, employee_contribution: 1282.50, employer_contribution: 1282.50 },
  { range_start: 28750, range_end: 29249.99, employee_contribution: 1305.00, employer_contribution: 1305.00 },
  { range_start: 29250, range_end: 29749.99, employee_contribution: 1327.50, employer_contribution: 1327.50 },
  { range_start: 29750, range_end: 30249.99, employee_contribution: 1350.00, employer_contribution: 1350.00 },
  { range_start: 30250, range_end: 30749.99, employee_contribution: 1372.50, employer_contribution: 1372.50 },
  { range_start: 30750, range_end: 31249.99, employee_contribution: 1395.00, employer_contribution: 1395.00 },
  { range_start: 31250, range_end: 31749.99, employee_contribution: 1417.50, employer_contribution: 1417.50 },
  { range_start: 31750, range_end: 32249.99, employee_contribution: 1440.00, employer_contribution: 1440.00 },
  { range_start: 32250, range_end: 32749.99, employee_contribution: 1462.50, employer_contribution: 1462.50 },
  { range_start: 32750, range_end: 33249.99, employee_contribution: 1485.00, employer_contribution: 1485.00 },
  { range_start: 33250, range_end: 33749.99, employee_contribution: 1507.50, employer_contribution: 1507.50 },
  { range_start: 33750, range_end: 34249.99, employee_contribution: 1530.00, employer_contribution: 1530.00 },
  { range_start: 34250, range_end: 34749.99, employee_contribution: 1552.50, employer_contribution: 1552.50 },
  { range_start: 34750, range_end: 35249.99, employee_contribution: 1575.00, employer_contribution: 1575.00 },
  { range_start: 35250, range_end: 35749.99, employee_contribution: 1597.50, employer_contribution: 1597.50 },
  { range_start: 35750, range_end: 36249.99, employee_contribution: 1620.00, employer_contribution: 1620.00 },
  { range_start: 36250, range_end: 36749.99, employee_contribution: 1642.50, employer_contribution: 1642.50 },
  { range_start: 36750, range_end: 37249.99, employee_contribution: 1665.00, employer_contribution: 1665.00 },
  { range_start: 37250, range_end: 37749.99, employee_contribution: 1687.50, employer_contribution: 1687.50 },
  { range_start: 37750, range_end: 38249.99, employee_contribution: 1710.00, employer_contribution: 1710.00 },
  { range_start: 38250, range_end: 38749.99, employee_contribution: 1732.50, employer_contribution: 1732.50 },
  { range_start: 38750, range_end: 39249.99, employee_contribution: 1755.00, employer_contribution: 1755.00 },
  { range_start: 39250, range_end: 39749.99, employee_contribution: 1777.50, employer_contribution: 1777.50 },
  { range_start: 39750, range_end: 40249.99, employee_contribution: 1800.00, employer_contribution: 1800.00 },
  { range_start: 40250, range_end: 40749.99, employee_contribution: 1822.50, employer_contribution: 1822.50 },
  { range_start: 40750, range_end: 41249.99, employee_contribution: 1845.00, employer_contribution: 1845.00 },
  { range_start: 41250, range_end: 41749.99, employee_contribution: 1867.50, employer_contribution: 1867.50 },
  { range_start: 41750, range_end: 42249.99, employee_contribution: 1890.00, employer_contribution: 1890.00 },
  { range_start: 42250, range_end: 42749.99, employee_contribution: 1912.50, employer_contribution: 1912.50 },
  { range_start: 42750, range_end: 43249.99, employee_contribution: 1935.00, employer_contribution: 1935.00 },
  { range_start: 43250, range_end: 43749.99, employee_contribution: 1957.50, employer_contribution: 1957.50 },
  { range_start: 43750, range_end: 44249.99, employee_contribution: 1980.00, employer_contribution: 1980.00 },
  { range_start: 44250, range_end: 44749.99, employee_contribution: 2002.50, employer_contribution: 2002.50 },
  { range_start: 44750, range_end: 45249.99, employee_contribution: 2025.00, employer_contribution: 2025.00 },
  { range_start: 45250, range_end: 45749.99, employee_contribution: 2047.50, employer_contribution: 2047.50 },
  { range_start: 45750, range_end: 46249.99, employee_contribution: 2070.00, employer_contribution: 2070.00 },
  { range_start: 46250, range_end: 46749.99, employee_contribution: 2092.50, employer_contribution: 2092.50 },
  { range_start: 46750, range_end: 47249.99, employee_contribution: 2115.00, employer_contribution: 2115.00 },
  { range_start: 47250, range_end: 47749.99, employee_contribution: 2137.50, employer_contribution: 2137.50 },
  { range_start: 47750, range_end: 48249.99, employee_contribution: 2160.00, employer_contribution: 2160.00 },
  { range_start: 48250, range_end: 48749.99, employee_contribution: 2182.50, employer_contribution: 2182.50 },
  { range_start: 48750, range_end: 49249.99, employee_contribution: 2205.00, employer_contribution: 2205.00 },
  { range_start: 49250, range_end: 49749.99, employee_contribution: 2227.50, employer_contribution: 2227.50 },
  { range_start: 49750, range_end: 50249.99, employee_contribution: 2250.00, employer_contribution: 2250.00 },
  { range_start: 50250, range_end: 50749.99, employee_contribution: 2272.50, employer_contribution: 2272.50 },
  { range_start: 50750, range_end: 51249.99, employee_contribution: 2295.00, employer_contribution: 2295.00 },
  { range_start: 51250, range_end: 51749.99, employee_contribution: 2317.50, employer_contribution: 2317.50 },
  { range_start: 51750, range_end: 52249.99, employee_contribution: 2340.00, employer_contribution: 2340.00 },
  { range_start: 52250, range_end: 52749.99, employee_contribution: 2362.50, employer_contribution: 2362.50 },
  { range_start: 52750, range_end: 53249.99, employee_contribution: 2385.00, employer_contribution: 2385.00 },
  { range_start: 53250, range_end: 53749.99, employee_contribution: 2407.50, employer_contribution: 2407.50 },
  { range_start: 53750, range_end: 54249.99, employee_contribution: 2430.00, employer_contribution: 2430.00 },
  { range_start: 54250, range_end: 54749.99, employee_contribution: 2452.50, employer_contribution: 2452.50 },
  { range_start: 54750, range_end: 55249.99, employee_contribution: 2475.00, employer_contribution: 2475.00 },
  { range_start: 55250, range_end: 55749.99, employee_contribution: 2497.50, employer_contribution: 2497.50 },
  { range_start: 55750, range_end: 56249.99, employee_contribution: 2520.00, employer_contribution: 2520.00 },
  { range_start: 56250, range_end: 56749.99, employee_contribution: 2542.50, employer_contribution: 2542.50 },
  { range_start: 56750, range_end: 57249.99, employee_contribution: 2565.00, employer_contribution: 2565.00 },
  { range_start: 57250, range_end: 57749.99, employee_contribution: 2587.50, employer_contribution: 2587.50 },
  { range_start: 57750, range_end: 58249.99, employee_contribution: 2610.00, employer_contribution: 2610.00 },
  { range_start: 58250, range_end: 58749.99, employee_contribution: 2632.50, employer_contribution: 2632.50 },
  { range_start: 58750, range_end: 59249.99, employee_contribution: 2655.00, employer_contribution: 2655.00 },
  { range_start: 59250, range_end: 59749.99, employee_contribution: 2677.50, employer_contribution: 2677.50 },
  { range_start: 59750, range_end: 60249.99, employee_contribution: 2700.00, employer_contribution: 2700.00 },
  { range_start: 60250, range_end: 60749.99, employee_contribution: 2722.50, employer_contribution: 2722.50 },
  { range_start: 60750, range_end: 61249.99, employee_contribution: 2745.00, employer_contribution: 2745.00 },
  { range_start: 61250, range_end: 61749.99, employee_contribution: 2767.50, employer_contribution: 2767.50 },
  { range_start: 61750, range_end: 62249.99, employee_contribution: 2790.00, employer_contribution: 2790.00 },
  { range_start: 62250, range_end: 62749.99, employee_contribution: 2812.50, employer_contribution: 2812.50 },
  { range_start: 62750, range_end: 63249.99, employee_contribution: 2835.00, employer_contribution: 2835.00 },
  { range_start: 63250, range_end: 63749.99, employee_contribution: 2857.50, employer_contribution: 2857.50 },
  { range_start: 63750, range_end: 64249.99, employee_contribution: 2880.00, employer_contribution: 2880.00 },
  { range_start: 64250, range_end: 64749.99, employee_contribution: 2902.50, employer_contribution: 2902.50 },
  { range_start: 64750, range_end: 65249.99, employee_contribution: 2925.00, employer_contribution: 2925.00 },
  { range_start: 65250, range_end: 65749.99, employee_contribution: 2947.50, employer_contribution: 2947.50 },
  { range_start: 65750, range_end: 66249.99, employee_contribution: 2970.00, employer_contribution: 2970.00 },
  { range_start: 66250, range_end: 66749.99, employee_contribution: 2992.50, employer_contribution: 2992.50 },
  { range_start: 66750, range_end: 67249.99, employee_contribution: 3015.00, employer_contribution: 3015.00 },
  { range_start: 67250, range_end: 67749.99, employee_contribution: 3037.50, employer_contribution: 3037.50 },
  { range_start: 67750, range_end: 68249.99, employee_contribution: 3060.00, employer_contribution: 3060.00 },
  { range_start: 68250, range_end: 68749.99, employee_contribution: 3082.50, employer_contribution: 3082.50 },
  { range_start: 68750, range_end: 69249.99, employee_contribution: 3105.00, employer_contribution: 3105.00 },
  { range_start: 69250, range_end: 69749.99, employee_contribution: 3127.50, employer_contribution: 3127.50 },
  { range_start: 69750, range_end: 70249.99, employee_contribution: 3150.00, employer_contribution: 3150.00 },
  { range_start: 70250, range_end: 70749.99, employee_contribution: 3172.50, employer_contribution: 3172.50 },
  { range_start: 70750, range_end: 71249.99, employee_contribution: 3195.00, employer_contribution: 3195.00 },
  { range_start: 71250, range_end: 71749.99, employee_contribution: 3217.50, employer_contribution: 3217.50 },
  { range_start: 71750, range_end: 72249.99, employee_contribution: 3240.00, employer_contribution: 3240.00 },
  { range_start: 72250, range_end: 72749.99, employee_contribution: 3262.50, employer_contribution: 3262.50 },
  { range_start: 72750, range_end: 73249.99, employee_contribution: 3285.00, employer_contribution: 3285.00 },
  { range_start: 73250, range_end: 73749.99, employee_contribution: 3307.50, employer_contribution: 3307.50 },
  { range_start: 73750, range_end: 74249.99, employee_contribution: 3330.00, employer_contribution: 3330.00 },
  { range_start: 74250, range_end: 74749.99, employee_contribution: 3352.50, employer_contribution: 3352.50 },
  { range_start: 74750, range_end: 75249.99, employee_contribution: 3375.00, employer_contribution: 3375.00 },
  { range_start: 75250, range_end: 75749.99, employee_contribution: 3397.50, employer_contribution: 3397.50 },
  { range_start: 75750, range_end: 76249.99, employee_contribution: 3420.00, employer_contribution: 3420.00 },
  { range_start: 76250, range_end: 76749.99, employee_contribution: 3442.50, employer_contribution: 3442.50 },
  { range_start: 76750, range_end: 77249.99, employee_contribution: 3465.00, employer_contribution: 3465.00 },
  { range_start: 77250, range_end: 77749.99, employee_contribution: 3487.50, employer_contribution: 3487.50 },
  { range_start: 77750, range_end: 78249.99, employee_contribution: 3510.00, employer_contribution: 3510.00 },
  { range_start: 78250, range_end: 78749.99, employee_contribution: 3532.50, employer_contribution: 3532.50 },
  { range_start: 78750, range_end: 79249.99, employee_contribution: 3555.00, employer_contribution: 3555.00 },
  { range_start: 79250, range_end: 79749.99, employee_contribution: 3577.50, employer_contribution: 3577.50 },
  { range_start: 79750, range_end: 80249.99, employee_contribution: 3600.00, employer_contribution: 3600.00 },
  { range_start: 80250, range_end: 80749.99, employee_contribution: 3622.50, employer_contribution: 3622.50 },
  { range_start: 80750, range_end: 81249.99, employee_contribution: 3645.00, employer_contribution: 3645.00 },
  { range_start: 81250, range_end: 81749.99, employee_contribution: 3667.50, employer_contribution: 3667.50 },
  { range_start: 81750, range_end: 82249.99, employee_contribution: 3690.00, employer_contribution: 3690.00 },
  { range_start: 82250, range_end: 82749.99, employee_contribution: 3712.50, employer_contribution: 3712.50 },
  { range_start: 82750, range_end: 83249.99, employee_contribution: 3735.00, employer_contribution: 3735.00 },
  { range_start: 83250, range_end: 83749.99, employee_contribution: 3757.50, employer_contribution: 3757.50 },
  { range_start: 83750, range_end: 84249.99, employee_contribution: 3780.00, employer_contribution: 3780.00 },
  { range_start: 84250, range_end: 84749.99, employee_contribution: 3802.50, employer_contribution: 3802.50 },
  { range_start: 84750, range_end: 85249.99, employee_contribution: 3825.00, employer_contribution: 3825.00 },
  { range_start: 85250, range_end: 85749.99, employee_contribution: 3847.50, employer_contribution: 3847.50 },
  { range_start: 85750, range_end: 86249.99, employee_contribution: 3870.00, employer_contribution: 3870.00 },
  { range_start: 86250, range_end: 86749.99, employee_contribution: 3892.50, employer_contribution: 3892.50 },
  { range_start: 86750, range_end: 87249.99, employee_contribution: 3915.00, employer_contribution: 3915.00 },
  { range_start: 87250, range_end: 87749.99, employee_contribution: 3937.50, employer_contribution: 3937.50 },
  { range_start: 87750, range_end: 88249.99, employee_contribution: 3960.00, employer_contribution: 3960.00 },
  { range_start: 88250, range_end: 88749.99, employee_contribution: 3982.50, employer_contribution: 3982.50 },
  { range_start: 88750, range_end: 89249.99, employee_contribution: 4005.00, employer_contribution: 4005.00 },
  { range_start: 89250, range_end: 89749.99, employee_contribution: 4027.50, employer_contribution: 4027.50 },
  { range_start: 89750, range_end: 90249.99, employee_contribution: 4050.00, employer_contribution: 4050.00 },
  { range_start: 90250, range_end: 90749.99, employee_contribution: 4072.50, employer_contribution: 4072.50 },
  { range_start: 90750, range_end: 91249.99, employee_contribution: 4095.00, employer_contribution: 4095.00 },
  { range_start: 91250, range_end: 91749.99, employee_contribution: 4117.50, employer_contribution: 4117.50 },
  { range_start: 91750, range_end: 92249.99, employee_contribution: 4140.00, employer_contribution: 4140.00 },
  { range_start: 92250, range_end: 92749.99, employee_contribution: 4162.50, employer_contribution: 4162.50 },
  { range_start: 92750, range_end: 93249.99, employee_contribution: 4185.00, employer_contribution: 4185.00 },
  { range_start: 93250, range_end: 93749.99, employee_contribution: 4207.50, employer_contribution: 4207.50 },
  { range_start: 93750, range_end: 94249.99, employee_contribution: 4230.00, employer_contribution: 4230.00 },
  { range_start: 94250, range_end: 94749.99, employee_contribution: 4252.50, employer_contribution: 4252.50 },
  { range_start: 94750, range_end: 95249.99, employee_contribution: 4275.00, employer_contribution: 4275.00 },
  { range_start: 95250, range_end: 95749.99, employee_contribution: 4297.50, employer_contribution: 4297.50 },
  { range_start: 95750, range_end: 96249.99, employee_contribution: 4320.00, employer_contribution: 4320.00 },
  { range_start: 96250, range_end: 96749.99, employee_contribution: 4342.50, employer_contribution: 4342.50 },
  { range_start: 96750, range_end: 97249.99, employee_contribution: 4365.00, employer_contribution: 4365.00 },
  { range_start: 97250, range_end: 97749.99, employee_contribution: 4387.50, employer_contribution: 4387.50 },
  { range_start: 97750, range_end: 98249.99, employee_contribution: 4410.00, employer_contribution: 4410.00 },
  { range_start: 98250, range_end: 98749.99, employee_contribution: 4432.50, employer_contribution: 4432.50 },
  { range_start: 98750, range_end: 99249.99, employee_contribution: 4455.00, employer_contribution: 4455.00 },
  { range_start: 99250, range_end: 99749.99, employee_contribution: 4477.50, employer_contribution: 4477.50 },
  { range_start: 99750, range_end: 100000, employee_contribution: 4500.00, employer_contribution: 4500.00 }
];

// Insert SSS rates
const insertSSS = db.prepare(`
  INSERT OR IGNORE INTO sss_contributions (range_start, range_end, employee_contribution, employer_contribution, effective_date)
  VALUES (?, ?, ?, ?, '2024-01-01')
`);

sssRates.forEach(rate => {
  insertSSS.run(rate.range_start, rate.range_end, rate.employee_contribution, rate.employer_contribution);
});

// Insert PhilHealth rates
const insertPhilHealth = db.prepare(`
  INSERT OR IGNORE INTO philhealth_contributions (range_start, range_end, employee_contribution, employer_contribution, effective_date)
  VALUES (?, ?, ?, ?, '2024-01-01')
`);

insertPhilHealth.run(10000, 10000, 150.00, 150.00);
insertPhilHealth.run(10000.01, 999999.99, 0.045, 0.045);

// Insert Pag-IBIG rates
const insertPagIBIG = db.prepare(`
  INSERT OR IGNORE INTO pagibig_contributions (range_start, range_end, employee_contribution, employer_contribution, effective_date)
  VALUES (?, ?, ?, ?, '2024-01-01')
`);

insertPagIBIG.run(1000, 1500, 0.01, 0.02);
insertPagIBIG.run(1500.01, 999999.99, 0.02, 0.02);

// Insert BIR tax brackets
const insertBIR = db.prepare(`
  INSERT OR IGNORE INTO bir_tax_brackets (range_start, range_end, base_tax, tax_rate, effective_date)
  VALUES (?, ?, ?, ?, '2024-01-01')
`);

insertBIR.run(0, 250000, 0, 0.00);
insertBIR.run(250000.01, 400000, 0, 0.15);
insertBIR.run(400000.01, 800000, 22500, 0.20);
insertBIR.run(800000.01, 2000000, 102500, 0.25);
insertBIR.run(2000000.01, 8000000, 402500, 0.30);
insertBIR.run(8000000.01, 999999999, 2202500, 0.35);

console.log('PH contribution data populated successfully!');
db.close();
