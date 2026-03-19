// ===== DUAL CURRENCY CONVERTER - BASIC & ADVANCED =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Currency Converter loaded');
    
    // ===== API KEYS =====
    const FREECURRENCY_API_KEY = 'fca_live_fWqxQiG6QLgzm4uudN2n7UysTLc6829kvYhDTRu5';
    
    // ===== DOM Elements =====
    // Mode buttons
    const basicModeBtn = document.getElementById('basicModeBtn');
    const advancedModeBtn = document.getElementById('advancedModeBtn');
    const basicConverter = document.getElementById('basicConverter');
    const advancedConverter = document.getElementById('advancedConverter');
    
    // Remove the error check - let elements be undefined and handle later
    console.log('Elements found:', {
        basicModeBtn: !!basicModeBtn,
        advancedModeBtn: !!advancedModeBtn,
        basicConverter: !!basicConverter,
        advancedConverter: !!advancedConverter
    });
    
    // Basic converter elements
    const basicAmount = document.getElementById('basicAmount');
    const basicFrom = document.getElementById('basicFrom');
    const basicTo = document.getElementById('basicTo');
    const basicSwapBtn = document.getElementById('basicSwapBtn');
    const basicConvertBtn = document.getElementById('basicConvertBtn');
    const basicResult = document.getElementById('basicResult');
    const basicFromAmount = document.getElementById('basicFromAmount');
    const basicToAmount = document.getElementById('basicToAmount');
    const basicRate = document.getElementById('basicRate');
    const basicUpdated = document.getElementById('basicUpdated');
    
    // Advanced converter elements
    const advancedAmount = document.getElementById('advancedAmount');
    const advancedFrom = document.getElementById('advancedFrom');
    const advancedTo = document.getElementById('advancedTo');
    const advancedSwapBtn = document.getElementById('advancedSwapBtn');
    const advancedConvertBtn = document.getElementById('advancedConvertBtn');
    const advancedResult = document.getElementById('advancedResult');
    const advancedFromAmount = document.getElementById('advancedFromAmount');
    const advancedToAmount = document.getElementById('advancedToAmount');
    const advancedRate = document.getElementById('advancedRate');
    const advancedUpdated = document.getElementById('advancedUpdated');
    
    // Popular pairs
    const pairTags = document.querySelectorAll('.pair-tag');
    
    // ===== Currency Data =====
    // Basic currencies (Frankfurter - 30+ major currencies)
    const basicCurrencies = [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
        { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
        { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
        { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
        { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
        { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
        { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
        { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
        { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
        { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
        { code: 'PLN', name: 'Polish Złoty', symbol: 'zł' },
        { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
        { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
        { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
        { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
        { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
        { code: 'THB', name: 'Thai Baht', symbol: '฿' },
        { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
        { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
        { code: 'PHP', name: 'Philippine Peso', symbol: '₱' }
    ];
    
    // Advanced currencies (FreeCurrencyAPI - 150+ currencies)
    // Using same list for demo, in production this would be fetched from API
    const advancedCurrencies = [...basicCurrencies];
    
    // Add more exotic currencies for advanced mode
    const exoticCurrencies = [
        { code: 'AFN', name: 'Afghan Afghani', symbol: '؋' },
        { code: 'ALL', name: 'Albanian Lek', symbol: 'L' },
        { code: 'AMD', name: 'Armenian Dram', symbol: '֏' },
        { code: 'ANG', name: 'Netherlands Antillean Guilder', symbol: 'ƒ' },
        { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz' },
        { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
        { code: 'AWG', name: 'Aruban Florin', symbol: 'ƒ' },
        { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼' },
        { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM' },
        { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$' },
        { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
        { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
        { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
        { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu' },
        { code: 'BMD', name: 'Bermudian Dollar', symbol: '$' },
        { code: 'BND', name: 'Brunei Dollar', symbol: 'B$' },
        { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs' },
        { code: 'BSD', name: 'Bahamian Dollar', symbol: 'B$' },
        { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.' },
        { code: 'BWP', name: 'Botswana Pula', symbol: 'P' },
        { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br' },
        { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$' },
        { code: 'CDF', name: 'Congolese Franc', symbol: 'FC' },
        { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
        { code: 'COP', name: 'Colombian Peso', symbol: '$' },
        { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡' },
        { code: 'CUP', name: 'Cuban Peso', symbol: '$' },
        { code: 'CVE', name: 'Cape Verdean Escudo', symbol: '$' },
        { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj' },
        { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$' },
        { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج' },
        { code: 'EGP', name: 'Egyptian Pound', symbol: '£' },
        { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk' },
        { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
        { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$' },
        { code: 'FKP', name: 'Falkland Islands Pound', symbol: '£' },
        { code: 'FOK', name: 'Faroese Króna', symbol: 'kr' },
        { code: 'GEL', name: 'Georgian Lari', symbol: '₾' },
        { code: 'GGP', name: 'Guernsey Pound', symbol: '£' },
        { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
        { code: 'GIP', name: 'Gibraltar Pound', symbol: '£' },
        { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D' },
        { code: 'GNF', name: 'Guinean Franc', symbol: 'FG' },
        { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q' },
        { code: 'GYD', name: 'Guyanese Dollar', symbol: 'GY$' },
        { code: 'HNL', name: 'Honduran Lempira', symbol: 'L' },
        { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn' },
        { code: 'HTG', name: 'Haitian Gourde', symbol: 'G' },
        { code: 'IMP', name: 'Isle of Man Pound', symbol: '£' },
        { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د' },
        { code: 'IRR', name: 'Iranian Rial', symbol: '﷼' },
        { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr' },
        { code: 'JEP', name: 'Jersey Pound', symbol: '£' },
        { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$' },
        { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا' },
        { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
        { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'с' },
        { code: 'KHR', name: 'Cambodian Riel', symbol: '៛' },
        { code: 'KID', name: 'Kiribati Dollar', symbol: '$' },
        { code: 'KMF', name: 'Comorian Franc', symbol: 'CF' },
        { code: 'KYD', name: 'Cayman Islands Dollar', symbol: 'CI$' },
        { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸' },
        { code: 'LAK', name: 'Lao Kip', symbol: '₭' },
        { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل' },
        { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
        { code: 'LRD', name: 'Liberian Dollar', symbol: 'L$' },
        { code: 'LSL', name: 'Lesotho Loti', symbol: 'L' },
        { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د' },
        { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
        { code: 'MDL', name: 'Moldovan Leu', symbol: 'L' },
        { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar' },
        { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден' },
        { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K' },
        { code: 'MNT', name: 'Mongolian Tögrög', symbol: '₮' },
        { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$' },
        { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM' },
        { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨' },
        { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf' },
        { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK' },
        { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT' },
        { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$' },
        { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
        { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$' },
        { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨' },
        { code: 'OMR', name: 'Omani Rial', symbol: '﷼' },
        { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.' },
        { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
        { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K' },
        { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
        { code: 'PYG', name: 'Paraguayan Guaraní', symbol: '₲' },
        { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼' },
        { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
        { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин' },
        { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF' },
        { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$' },
        { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨' },
        { code: 'SDG', name: 'Sudanese Pound', symbol: 'ج.س.' },
        { code: 'SHP', name: 'Saint Helena Pound', symbol: '£' },
        { code: 'SLE', name: 'Sierra Leonean Leone', symbol: 'Le' },
        { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh' },
        { code: 'SRD', name: 'Surinamese Dollar', symbol: '$' },
        { code: 'SSP', name: 'South Sudanese Pound', symbol: '£' },
        { code: 'STN', name: 'São Tomé and Príncipe Dobra', symbol: 'Db' },
        { code: 'SYP', name: 'Syrian Pound', symbol: '£' },
        { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'L' },
        { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'ЅМ' },
        { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'm' },
        { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت' },
        { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$' },
        { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: 'TT$' },
        { code: 'TVD', name: 'Tuvaluan Dollar', symbol: '$' },
        { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$' },
        { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
        { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
        { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U' },
        { code: 'UZS', name: 'Uzbekistani Som', symbol: 'soʻm' },
        { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs' },
        { code: 'VND', name: 'Vietnamese Đồng', symbol: '₫' },
        { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT' },
        { code: 'WST', name: 'Samoan Tālā', symbol: 'WS$' },
        { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA' },
        { code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$' },
        { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA' },
        { code: 'XPF', name: 'CFP Franc', symbol: '₣' },
        { code: 'YER', name: 'Yemeni Rial', symbol: '﷼' },
        { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK' }
    ];
    
    // Combine for advanced mode
    advancedCurrencies.push(...exoticCurrencies);
    
    // Sort currencies by code
    basicCurrencies.sort((a, b) => a.code.localeCompare(b.code));
    advancedCurrencies.sort((a, b) => a.code.localeCompare(b.code));
    
    // ===== Initialize Currency Selects =====
    function populateCurrencySelects() {
        if (basicFrom && basicTo) {
            populateSelect(basicFrom, basicCurrencies, 'USD');
            populateSelect(basicTo, basicCurrencies, 'EUR');
        }
        
        if (advancedFrom && advancedTo) {
            populateSelect(advancedFrom, advancedCurrencies, 'USD');
            populateSelect(advancedTo, advancedCurrencies, 'EUR');
        }
    }
    
    function populateSelect(select, currencies, defaultCode) {
        if (!select) return;
        select.innerHTML = '';
        currencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.code;
            option.textContent = `${currency.code} - ${currency.name}`;
            if (currency.code === defaultCode) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }
    
    // ===== Mode Switching =====
    if (basicModeBtn && advancedModeBtn && basicConverter && advancedConverter) {
        basicModeBtn.addEventListener('click', () => {
            basicModeBtn.classList.add('active');
            advancedModeBtn.classList.remove('active');
            basicConverter.style.display = 'block';
            advancedConverter.style.display = 'none';
        });
        
        advancedModeBtn.addEventListener('click', () => {
            advancedModeBtn.classList.add('active');
            basicModeBtn.classList.remove('active');
            advancedConverter.style.display = 'block';
            basicConverter.style.display = 'none';
        });
    }
    
    // ===== Swap Currencies =====
    if (basicSwapBtn && basicFrom && basicTo) {
        basicSwapBtn.addEventListener('click', () => {
            const temp = basicFrom.value;
            basicFrom.value = basicTo.value;
            basicTo.value = temp;
            if (typeof convertBasic === 'function') convertBasic();
        });
    }
    
    if (advancedSwapBtn && advancedFrom && advancedTo) {
        advancedSwapBtn.addEventListener('click', () => {
            const temp = advancedFrom.value;
            advancedFrom.value = advancedTo.value;
            advancedTo.value = temp;
            if (typeof convertAdvanced === 'function') convertAdvanced();
        });
    }
    
    // ===== Basic Conversion (Frankfurter - No API Key) =====
    async function convertBasic() {
        if (!basicAmount || !basicFrom || !basicTo || !basicResult || 
            !basicFromAmount || !basicToAmount || !basicRate || !basicUpdated) {
            console.error('Basic converter elements missing');
            return;
        }
        
        const amount = parseFloat(basicAmount.value) || 1;
        const from = basicFrom.value;
        const to = basicTo.value;
        
        if (from === to) {
            showBasicResult(amount, amount, 1);
            return;
        }
        
        try {
            const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`);
            const data = await response.json();
            
            if (data.rates && data.rates[to]) {
                const rate = data.rates[to];
                const result = amount * rate;
                showBasicResult(amount, result, rate, data.date);
            } else {
                throw new Error('Conversion failed');
            }
        } catch (error) {
            console.error('Basic conversion error:', error);
            basicResult.innerHTML = `
                <div style="color: #ef4444; text-align: center;">
                    <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>Conversion failed. Please try again.</p>
                </div>
            `;
            basicResult.style.display = 'block';
        }
    }
    
    function showBasicResult(amount, result, rate, date) {
        if (!basicFromAmount || !basicToAmount || !basicRate || !basicUpdated || !basicResult) return;
        
        const fromCurrency = basicCurrencies.find(c => c.code === basicFrom.value);
        const toCurrency = basicCurrencies.find(c => c.code === basicTo.value);
        
        basicFromAmount.textContent = `${amount} ${fromCurrency.code}`;
        basicToAmount.textContent = `${result.toFixed(2)} ${toCurrency.code}`;
        basicRate.textContent = `1 ${fromCurrency.code} = ${rate.toFixed(4)} ${toCurrency.code}`;
        
        if (date) {
            basicUpdated.textContent = `Last updated: ${new Date(date).toLocaleDateString()}`;
        } else {
            basicUpdated.textContent = 'Live rate';
        }
        
        basicResult.style.display = 'block';
    }
    
    // ===== Advanced Conversion (FreeCurrencyAPI) =====
    async function convertAdvanced() {
        if (!advancedAmount || !advancedFrom || !advancedTo || !advancedResult || 
            !advancedFromAmount || !advancedToAmount || !advancedRate || !advancedUpdated) {
            console.error('Advanced converter elements missing');
            return;
        }
        
        const amount = parseFloat(advancedAmount.value) || 1;
        const from = advancedFrom.value;
        const to = advancedTo.value;
        
        if (from === to) {
            showAdvancedResult(amount, amount, 1);
            return;
        }
        
        try {
            const url = `https://api.freecurrencyapi.com/v1/latest?apikey=${FREECURRENCY_API_KEY}&base_currency=${from}&currencies=${to}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.data && data.data[to]) {
                const rate = data.data[to];
                const result = amount * rate;
                showAdvancedResult(amount, result, rate);
            } else {
                throw new Error('No rate data received');
            }
        } catch (error) {
            console.error('Advanced conversion error:', error);
            
            // Fallback to Frankfurter
            try {
                const fallbackUrl = `https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`;
                const response = await fetch(fallbackUrl);
                const data = await response.json();
                
                if (data.rates && data.rates[to]) {
                    const rate = data.rates[to];
                    const result = amount * rate;
                    showAdvancedResult(amount, result, rate, data.date, true);
                } else {
                    throw new Error('Fallback failed');
                }
            } catch (fallbackError) {
                advancedResult.innerHTML = `
                    <div style="color: #ef4444; text-align: center;">
                        <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                        <p>Conversion failed. Please try again.</p>
                    </div>
                `;
                advancedResult.style.display = 'block';
            }
        }
    }
    
    function showAdvancedResult(amount, result, rate, date, isFallback = false) {
        if (!advancedFromAmount || !advancedToAmount || !advancedRate || !advancedUpdated || !advancedResult) return;
        
        const fromCurrency = advancedCurrencies.find(c => c.code === advancedFrom.value);
        const toCurrency = advancedCurrencies.find(c => c.code === advancedTo.value);
        
        advancedFromAmount.textContent = `${amount} ${fromCurrency.code}`;
        advancedToAmount.textContent = `${result.toFixed(2)} ${toCurrency.code}`;
        advancedRate.textContent = `1 ${fromCurrency.code} = ${rate.toFixed(4)} ${toCurrency.code}`;
        
        if (date) {
            advancedUpdated.textContent = `Last updated: ${new Date(date).toLocaleDateString()}`;
        } else {
            advancedUpdated.textContent = 'Live rate';
        }
        
        if (isFallback) {
            advancedUpdated.textContent += ' (using basic data)';
        }
        
        advancedResult.style.display = 'block';
    }
    
    // ===== Popular Pairs =====
    if (pairTags.length > 0) {
        pairTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const [from, to] = tag.textContent.split(' → ');
                
                // Check which mode is active
                if (basicConverter && basicConverter.style.display !== 'none' && basicFrom && basicTo) {
                    const fromOption = Array.from(basicFrom.options).find(opt => opt.value === from);
                    const toOption = Array.from(basicTo.options).find(opt => opt.value === to);
                    
                    if (fromOption && toOption) {
                        basicFrom.value = from;
                        basicTo.value = to;
                        convertBasic();
                    }
                } else if (advancedFrom && advancedTo) {
                    const fromOption = Array.from(advancedFrom.options).find(opt => opt.value === from);
                    const toOption = Array.from(advancedTo.options).find(opt => opt.value === to);
                    
                    if (fromOption && toOption) {
                        advancedFrom.value = from;
                        advancedTo.value = to;
                        convertAdvanced();
                    }
                }
            });
        });
    }
    
    // ===== Event Listeners =====
    if (basicConvertBtn) basicConvertBtn.addEventListener('click', convertBasic);
    if (advancedConvertBtn) advancedConvertBtn.addEventListener('click', convertAdvanced);
    
    if (basicAmount) basicAmount.addEventListener('input', convertBasic);
    if (basicFrom) basicFrom.addEventListener('change', convertBasic);
    if (basicTo) basicTo.addEventListener('change', convertBasic);
    
    if (advancedAmount) advancedAmount.addEventListener('input', convertAdvanced);
    if (advancedFrom) advancedFrom.addEventListener('change', convertAdvanced);
    if (advancedTo) advancedTo.addEventListener('change', convertAdvanced);
    
    // Enter key support
    if (basicAmount) {
        basicAmount.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') convertBasic();
        });
    }
    
    if (advancedAmount) {
        advancedAmount.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') convertAdvanced();
        });
    }
    
    // ===== Initialize =====
    populateCurrencySelects();
    
    // Perform initial conversions
    setTimeout(() => {
        convertBasic();
        convertAdvanced();
    }, 500);
    
    // ===== Track Tool Usage =====
    function trackToolUsage() {
        if (typeof firebase !== 'undefined') {
            const user = firebase.auth().currentUser;
            if (!user) {
                let guestUses = localStorage.getItem('toolsnova_guest_uses') ? 
                    parseInt(localStorage.getItem('toolsnova_guest_uses')) : 0;
                
                guestUses++;
                localStorage.setItem('toolsnova_guest_uses', guestUses);
            }
        }
    }
    
    // Track usage on conversions
    if (basicConvertBtn) basicConvertBtn.addEventListener('click', trackToolUsage);
    if (advancedConvertBtn) advancedConvertBtn.addEventListener('click', trackToolUsage);
});

// Firebase auth state observer
if (typeof firebase !== 'undefined') {
    firebase.auth().onAuthStateChanged(function(user) {
        const authLinks = document.getElementById('authLinks');
        const userMenu = document.getElementById('userMenu');
        const userGreeting = document.getElementById('userGreeting');
        const footerLogin = document.getElementById('footerLogin');
        const footerSignup = document.getElementById('footerSignup');
        const footerLogout = document.getElementById('footerLogout');
        const footerGuestInfo = document.getElementById('footerGuestInfo');
        
        if (user) {
            if (authLinks) authLinks.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                if (userGreeting) {
                    userGreeting.textContent = `Hi, ${user.email.split('@')[0]}`;
                }
            }
            if (footerLogin) footerLogin.style.display = 'none';
            if (footerSignup) footerSignup.style.display = 'none';
            if (footerLogout) footerLogout.style.display = 'block';
            if (footerGuestInfo) footerGuestInfo.style.display = 'none';
        } else {
            if (authLinks) authLinks.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
            if (footerLogin) footerLogin.style.display = 'block';
            if (footerSignup) footerSignup.style.display = 'block';
            if (footerLogout) footerLogout.style.display = 'none';
            if (footerGuestInfo) footerGuestInfo.style.display = 'flex';
        }
    });
}

// Update footer based on auth state
function updateFooterUI(user) {
    const footerGuestInfo = document.getElementById('footerGuestInfo');
    const footerUserInfo = document.getElementById('footerUserInfo');
    
    // Create user info element if it doesn't exist
    if (!footerUserInfo && footerGuestInfo) {
        const newUserInfo = document.createElement('div');
        newUserInfo.id = 'footerUserInfo';
        newUserInfo.className = 'user-info-footer';
        newUserInfo.style.display = 'none';
        newUserInfo.innerHTML = '<i class="fas fa-crown" style="color: var(--success);"></i><span>You have unlimited access</span>';
        footerGuestInfo.parentNode.appendChild(newUserInfo);
    }
}

// Update your existing auth observer
auth.onAuthStateChanged((user) => {
    console.log('Auth state changed:', user ? 'logged in' : 'guest');
    
    const authLinks = document.getElementById('authLinks');
    const userMenu = document.getElementById('userMenu');
    const userGreeting = document.getElementById('userGreeting');
    const footerLogin = document.getElementById('footerLogin');
    const footerSignup = document.getElementById('footerSignup');
    const footerLogout = document.getElementById('footerLogout');
    const footerGuestInfo = document.getElementById('footerGuestInfo');
    const footerUserInfo = document.getElementById('footerUserInfo');
    
    if (user) {
        // User is logged in
        if (authLinks) authLinks.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            if (userGreeting) {
                userGreeting.textContent = `Hi, ${user.email.split('@')[0]}`;
            }
        }
        if (footerLogin) footerLogin.style.display = 'none';
        if (footerSignup) footerSignup.style.display = 'none';
        if (footerLogout) footerLogout.style.display = 'block';
        
        // Hide guest info, show user info
        if (footerGuestInfo) footerGuestInfo.style.display = 'none';
        if (footerUserInfo) {
            footerUserInfo.style.display = 'flex';
        } else {
            // Create user info element if it doesn't exist
            const newUserInfo = document.createElement('div');
            newUserInfo.id = 'footerUserInfo';
            newUserInfo.className = 'user-info-footer';
            newUserInfo.style.display = 'flex';
            newUserInfo.innerHTML = '<i class="fas fa-crown" style="color: var(--success);"></i><span>You have unlimited access</span>';
            if (footerGuestInfo && footerGuestInfo.parentNode) {
                footerGuestInfo.parentNode.appendChild(newUserInfo);
            }
        }
    } else {
        // User is guest
        if (authLinks) authLinks.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (footerLogin) footerLogin.style.display = 'block';
        if (footerSignup) footerSignup.style.display = 'block';
        if (footerLogout) footerLogout.style.display = 'none';
        
        // Show guest info, hide user info
        if (footerGuestInfo) footerGuestInfo.style.display = 'flex';
        if (footerUserInfo) footerUserInfo.style.display = 'none';
    }
});